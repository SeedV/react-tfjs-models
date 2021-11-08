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
import Stats from 'stats.js';

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
    const stats = new Stats();
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
      const ikHelper = helper.objects.get(mesh)?.ikSolver.createHelper();

      if (ikHelper) {
        ikHelper.visible = false;
        scene.add(ikHelper);
      }
    };

    const createPhysicsHelper = () => {
      physics = helper.objects.get(mesh)?.physics;
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
      stats.begin();
      renderScene();
      frameId = window.requestAnimationFrame(animate);
      stats.end();
    };

    const norm = (p1, p2) => {
      return ((x, y) => Math.sqrt(x * x + y * y))(p1[0] - p2[0], p1[1] - p2[1]);
    };

    const mouthOpening = (mar) => {
      if (mar < 0.2) {
        return 0;
      } else if (mar < 0.3) {
        return 11;
      } else if (mar < 0.4) {
        return 12;
      } else if (mar < 0.6) {
        return 13;
      } else {
        return 14;
      }
    };

    const clamp = (num, min, max) => {
      return Math.min(Math.max(num, min), max);
    };

    const renderScene = () => {
      facemesh = props.facemesh.current;
      if (facemesh != null) {
        if (head != null) {
          const mesh = facemesh.scaledMesh;
          const y = clamp(
              getYRotation(point(mesh[33]), point(mesh[263]), point(mesh[1])),
              -0.4, 0.4);
          const z = clamp(
              getZRotation(point(mesh[33]), point(mesh[263])),
              -0.4, 0.4);
          previousHeadRotation = kalmanFilter.filter(
              {previousCorrected: previousHeadRotation, observation: [y, z]});
          head.setRotationFromEuler(
              new Euler(0,
                  previousHeadRotation.mean[0],
                  previousHeadRotation.mean[1]));
        }
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[11] = 0;
          mesh.morphTargetInfluences[12] = 0;
          mesh.morphTargetInfluences[13] = 0;
          mesh.morphTargetInfluences[14] = 0;
          const scaledMesh = facemesh.scaledMesh;
          const p1 = scaledMesh[78];
          const p2 = scaledMesh[81];
          const p3 = scaledMesh[13];
          const p4 = scaledMesh[311];
          const p5 = scaledMesh[308];
          const p6 = scaledMesh[402];
          const p7 = scaledMesh[14];
          const p8 = scaledMesh[178];

          const mar = (norm(p2, p8) + norm(p3, p7) + norm(p4, p6)) /
            (2 * norm(p1, p5) + 1e-6);

          const opening = mouthOpening(mar);
          if (opening > 0) {
            mesh.morphTargetInfluences[opening] = 1;
          }
        }
      }
      helper.update(clock.getDelta());
      renderer.render(scene, camera);
    };

    const point = (mesh) => {
      return {x: mesh[0], y: mesh[1]};
    };

    mount.current.appendChild(renderer.domElement);

    mount.current.appendChild(stats.dom);

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
