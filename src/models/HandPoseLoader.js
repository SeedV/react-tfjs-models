import * as handpose from '@tensorflow-models/handpose';

const HandPoseLoader = () => {
  return handpose.load();
}

export default HandPoseLoader;