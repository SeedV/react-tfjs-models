/**
 * @license
 * Copyright 2021 The Aha001 Team.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Camera from '../components/Camera';
import BlazePose from '../components/BlazePose';
import {Canvas} from '@react-three/fiber';
import Mousy from '../components/Mousy';
import {Suspense, useRef} from 'react';

const style = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: -1,
  width: 160,
  height: 120,
};

const CartoonMirror = (props) => {
  const keypoints = useRef();

  const onPoseEstimate = (pose) => {
    keypoints.current = pose.keypoints;
  };

  return <div>
    <Camera style={style}>
      <BlazePose
        backend='wasm'
        runtime='mediapipe'
        maxPoses={1}
        flipHorizontal={true}
        onPoseEstimate={onPoseEstimate}/>
    </Camera>
    <div style={{position: 'relative', width: 600, height: 600}}>
      <Canvas
        colorManagement
        shadowMap
        camera={{position: [0, 0, 2], fov: 60}}>
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[-8, 16, -8]}
          intensity={0}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10} />
        <pointLight position={[0, 50, 0]} intensity={2} />
        <Suspense fallback={null}>
          <mesh position={[0, -1, 0]}>
            <Mousy keypoints={keypoints}/>
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  </div>;
};

export default CartoonMirror;
