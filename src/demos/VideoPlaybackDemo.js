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
import {Suspense, useRef, useState} from 'react';
import * as posedetection from '@tensorflow-models/pose-detection';
import {Canvas} from '@react-three/fiber';
import Mousy from '../components/Mousy';
import * as tf from '@tensorflow/tfjs-core';

const VideoPlaybackDemo = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasRef = useRef(null);
  const rafIdRef = useRef(0);
  const detectorRef = useRef(null);
  const keypointsRef = useRef(null);
  const DEFAULT_LINE_WIDTH = 3;
  const DEFAULT_RADIUS = 5;

  const model = posedetection.SupportedModels.MoveNet;
  const modelConfig = {
    type: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    maxPoses: 1,
    scoreThreshold: 0.65,
  };

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

  const setupDetector = async () => {
    const createDetector = async () => {
      return posedetection.createDetector(model, {
        modelType: modelConfig.type,
      });
    };

    detectorRef.current = await createDetector();
    animate();
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

    if (typeof poses === 'undefined' || poses === null || poses.length === 0) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
    for (const pose of poses) {
      drawPose(pose, ctx);
    }
  };

  const drawPose = (predictions, ctx) => {
    const keypoints = predictions.keypoints;
    keypointsRef.current = keypoints;
    drawKeypoints(keypoints, ctx);
    drawSkeleton(keypoints, ctx);
  };

  const drawKeypoints = (keypoints, ctx) => {
    const keypointInd =
       posedetection.util.getKeypointIndexBySide(model);

    for (const i of keypointInd.middle) {
      drawKeypoint(keypoints[i], 'yellow', ctx);
    }

    for (const i of keypointInd.left) {
      drawKeypoint(keypoints[i], 'lime', ctx);
    }

    for (const i of keypointInd.right) {
      drawKeypoint(keypoints[i], 'red', ctx);
    }
  };

  const drawKeypoint = (keypoint, color, ctx) => {
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = modelConfig.scoreThreshold || 0;

    if (score >= scoreThreshold) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  const drawSkeleton = (keypoints, ctx) => {
    ctx.fillStyle = 'White';
    ctx.strokeStyle = 'White';
    ctx.lineWidth = DEFAULT_LINE_WIDTH;

    posedetection.util.getAdjacentPairs(model)
        .forEach(([i, j]) => {
          const kp1 = keypoints[i];
          const kp2 = keypoints[j];

          // If score is null, just show the keypoint.
          const score1 = kp1.score != null ? kp1.score : 1;
          const score2 = kp2.score != null ? kp2.score : 1;
          const scoreThreshold = modelConfig.scoreThreshold || 0;

          if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
          }
        });
  };

  /**
   * Sets the backend.
   * @param {string} backend
   */
  async function setBackend() {
    await tf.setBackend('webgl');
  }

  const run = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setBackend();
    setupDetector();
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
