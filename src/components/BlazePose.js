import {useContext, useEffect, useCallback} from 'react';
import {VideoContext} from './global';
import useModel from '../hooks/useModel';
import BlazePoseLoader from '../models/BlazePoseLoader';

const estimatePoseParam = {
  maxPoses: 1,
  flipHorizontal: true,
};

const BlazePose = (props) => {
  const videoState = useContext(VideoContext);
  const detector = useModel(BlazePoseLoader, props);

  /**
   * Processes the video image with the pose estimator.
   *
   * @param {HTMLMediaElement} video
   */
  const onEstimate = useCallback(async (video) => {
    const poseDetector = detector.current;
    if (poseDetector !== null) {
      const poses = await poseDetector.estimatePoses(video, estimatePoseParam);
      console.log(poses);
    }
  }, [detector]);

  useEffect(() => {
    onEstimate(videoState.video);
  }, [videoState, onEstimate]);

  return <div/>;
};

export default BlazePose;
