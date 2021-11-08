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
import {
  MMDPhysics,
  MMDPhysicsHelper,
} from 'three/examples/jsm/animation/MMDPhysics';
import {CCDIKHelper} from 'three/examples/jsm/animation/CCDIKSolver';
import {MMDLoader} from 'three/examples/jsm/loaders/MMDLoader';
import {OutlineEffect} from 'three/examples/jsm/effects/OutlineEffect.js';


let helper;
const modelFile = '../../../kizunaai/kizunaai.pmx';
let effect;
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
    const width = mount.current.clientWidth;
    const height = mount.current.clientHeight;
    let frameId;

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

    effect = new OutlineEffect(renderer, {});

    helper = new MMDAnimationHelper();
    const mmdLoader = new MMDLoader();
    mmdLoader.load(modelFile, async (object) => {
      mesh = object;
      mesh.position.y = gridHelper.position.y;

      scene.add(mesh);

      helper.add(mesh, {physics: false});

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
      const bones = mesh.skeleton.bones;
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
      if (head != null) {
        // head.rotation.x = Math.PI / 8;
        head.rotation.y = 0;
      }
      helper.update(clock.getDelta());
      renderer.render(scene, camera);
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
  });

  return (
    <div ref={mount} style={{position: 'relative', width: 600, height: 600}} />
  );
}
