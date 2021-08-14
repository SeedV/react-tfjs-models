import * as posedetection from '@tensorflow-models/pose-detection';

const BlazePoseLoader = (props) => {
  const {type, runtime} = props;

  if (runtime === 'mediapipe') {
    return posedetection.createDetector(posedetection.SupportedModels.BlazePose, {
      runtime,
      modelType: type != null ? type : 'full',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'
    });
  } else if (runtime === 'tfjs') {
    return posedetection.createDetector(posedetection.SupportedModels.BlazePose, {
      runtime,
      modelType: type != null ? type : 'full'
    });
  } else {
    console.warn("The runtime is not supported");
  }
}

export default BlazePoseLoader;
