import {useContext, useEffect, useCallback} from 'react';
import {VideoContext} from './global';
import useModel from '../hooks/useModel';
import BlazePoseLoader from '../models/BlazePoseLoader';

const BlazePose = (props) => {
  const videoState = useContext(VideoContext);
  const detector = useModel(BlazePoseLoader, props);
  const {maxPoses = 1, flipHorizontal} = props;

  /**
   * Processes the video image with the pose estimator.
   *
   * @param {HTMLMediaElement} video
   */
  const onEstimate = useCallback(async (video) => {
    const poseDetector = detector.current;
    if (poseDetector !== null) {
      const poses = await poseDetector.estimatePoses(video, {
        maxPoses: maxPoses,
        flipHorizontal: flipHorizontal,
      });
      console.log(poses);
    }
  }, [detector, maxPoses, flipHorizontal]);

  useEffect(() => {
    onEstimate(videoState.video);
  }, [videoState, onEstimate]);

  return <div/>;
};

export default BlazePose;
