/**
 * @license
 * Copyright 2021 The Aha001 Team.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {MMDAnimationHelper} from
  'three/examples/jsm/animation/MMDAnimationHelper.js';
import {MMDLoader} from 'three/examples/jsm/loaders/MMDLoader';
import {getYRotation, getZRotation} from '../utils/keypoints';
import {Euler} from 'three';
import {KalmanFilter} from 'kalman-filter';

/** @type {MMDAnimationHelper} */
let helper;
const modelFile = '../../../kizunaai/kizunaai.pmx';
/** @type {MMDAnimationHelperMixer.physics} */
let physics;
let head;

/**
  * Renders a <KizunaAi/> Actor.
  *
  * @param {Props} props
  * @return {string} rendered JSX.
  */
export default function KizunaAi(props) {
  const mount = useRef(null);

  useEffect(() => {
    let facemesh;
    const width = mount.current.clientWidth;
    const height = mount.current.clientHeight;
    /** @type {number} */
    let frameId;
    const kalmanFilter = new KalmanFilter({
      observation: 2,
      dynamic: 'constant-position',
    });
    let previousHeadRotation = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    const gridHelper = new THREE.PolarGridHelper(
        30,
        10,
        8,
        64,
        undefined,
        undefined,
    );
    const ambient = new THREE.AmbientLight(0x666666);
    const directionalLight = new THREE.DirectionalLight(0x887766);
    const clock = new THREE.Clock();

    let mesh;
    scene.add(ambient);
    directionalLight.position.set(-1, 1, 1).normalize();
    scene.add(directionalLight);

    gridHelper.position.y = -18;
    scene.add(gridHelper);

    camera.position.set(0, 0, 16);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);

    helper = new MMDAnimationHelper();
    /** @type {MMDLoader} */
    const mmdLoader = new MMDLoader();
    mmdLoader.load(modelFile, async (object) => {
      mesh = object;
      mesh.position.y = gridHelper.position.y;

      scene.add(mesh);

      helper.add(mesh, {physics: true});

      createIkHelper();
      createPhysicsHelper();
      bindBones();
    });

    const createIkHelper = () => {
      const ikHelper = helper.objects.get(mesh).ikSolver.createHelper();

      if (ikHelper) {
        ikHelper.visible = false;
        scene.add(ikHelper);
      }
    };

    const createPhysicsHelper = () => {
      physics = helper.objects.get(mesh).physics;
    };

    const bindBones = () => {
      const bones = physics?.mesh.skeleton.bones;
      if (bones) {
        head = bones[8];
      }
    };

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = null;
    };

    const animate = () => {
      renderScene();
      frameId = window.requestAnimationFrame(animate);
    };

    const renderScene = () => {
      facemesh = props.facemesh.current;
      if (facemesh != null) {
        if (head != null) {
          const mesh = facemesh.scaledMesh;
          const y = getYRotation(point(mesh[33]), point(mesh[263]),
              point(mesh[1]));
          const z = getZRotation(point(mesh[33]), point(mesh[263]));
          previousHeadRotation = kalmanFilter.filter(
              {previousCorrected: previousHeadRotation, observation: [y, z]});
          head.setRotationFromEuler(
              new Euler(0,
                  previousHeadRotation.mean[0],
                  previousHeadRotation.mean[1]));
        }
      }
      helper.update(clock.getDelta());
      renderer.render(scene, camera);
    };

    const point = (mesh) => {
      return {x: mesh[0], y: mesh[1]};
    };

    mount.current.appendChild(renderer.domElement);
    start();
    return () => {
      stop();
      scene.remove(ambient);
      scene.remove(gridHelper);
      scene.remove(mesh);
      ambient.dispose();
    };
  }, []); // eslint-disable-line

  return (
    <div ref={mount} style={{position: 'relative', width: 600, height: 600}} />
  );
}
