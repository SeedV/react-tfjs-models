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

import './VideoPlaybackDemo.css';
import {useRef, useState} from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import {drawPose} from '../utils/handpose';
import useModel from '../hooks/useModel';
import MoveNetLoader from '../models/MoveNetLoader';

const VideoPlaybackDemo = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasRef = useRef(null);
  const rafIdRef = useRef(0);
  const detectorRef = useModel(MoveNetLoader, {
    backend: 'webgl',
    type: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  });

  const model = posedetection.SupportedModels.MoveNet;
  const modelConfig = {
    type: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    maxPoses: 1,
    scoreThreshold: 0.65,
  };
  const keypointIndices = posedetection.util.getKeypointIndexBySide(model);
  const adjacentPairs = posedetection.util.getAdjacentPairs(model);

  const style = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  };

  const fileSelectedHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const fileUploadHandler = () => {
    const videoSource = URL.createObjectURL(selectedFile);
    sourceRef.current.src = videoSource;
    videoRef.current.load();
  };

  const animate = () => {
    if (detectorRef.current != null) {
      runDetection(detectorRef.current);
    }
    rafIdRef.current = requestAnimationFrame(animate);
  };

  const runDetection = async (detector) => {
    const video = videoRef.current;
    const poses = await detector.estimatePoses(
        video,
        {maxPoses: modelConfig.maxPoses, flipHorizontal: true});

    if (poses == null || poses.length === 0) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
    for (const pose of poses) {
      drawPose(pose, keypointIndices, adjacentPairs, ctx);
    }
  };

  const run = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    animate();
  };

  const onEnded = () => {
    detectorRef.current.dispose();
    detectorRef.current = null;
  };

  return (
    <div className="App">
      <input type="file" onChange={fileSelectedHandler} accept="video/*"/>
      <button onClick={fileUploadHandler}>Upload</button>
      <video ref={videoRef} autoPlay onLoadedData={run} onEnded={onEnded}
        style={style}>
        <source ref={sourceRef} type="video/mp4"/>
      </video>
      <canvas ref={canvasRef} style={style}/>
    </div>
  );
};

export default VideoPlaybackDemo;
