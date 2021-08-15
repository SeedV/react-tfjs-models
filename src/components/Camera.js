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

import {useEffect, useRef} from 'react';
import Webcam from 'react-webcam';

const Camera = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  /**
   * Detects camera characteristics.
   */
  function detect() {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      props.onEstimate(video);
    }
  }

  /**
   * Handles animation frames.
   */
  function onAnimate() {
    detect();
    requestAnimationFrame(onAnimate);
  }

  useEffect(() => {
    onAnimate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Webcam ref={webcamRef} mirrored style={props.style} />
      <canvas ref={canvasRef} style={props.style} />
    </div>
  );
};

export default Camera;
