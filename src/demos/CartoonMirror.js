import Camera from '../components/Camera';
import useModel from '../hooks/useModel';
import BlazePoseLoader from '../models/BlazePoseLoader';

const style = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: -1,
  width: 160,
  height: 120
};

const estimatePoseParam = {
  maxPoses: 1,
  flipHorizontal: true
};

const CartoonMirror = (props) => {
  const detector = useModel(BlazePoseLoader, {backend: 'wasm', runtime: 'mediapipe'});

  async function onEstimate(video) {
    const hands = detector.current;
    if (hands !== null) {
      const poses = await hands.estimatePoses(video, estimatePoseParam);
      console.log(poses);
    }
  }
    
  return (
    <>
    <Camera style={style} onEstimate={onEstimate} />
    </>
  );
}

export default CartoonMirror;