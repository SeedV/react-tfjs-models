import { useEffect, useRef } from 'react';
import Webcam from "react-webcam";

const Camera = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  function detect() {
    if (
      typeof webcamRef.current !== "undefined" &&
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

  function onAnimate() {
    detect();
    requestAnimationFrame(onAnimate);
  }

  useEffect(() => {
    onAnimate();
  }, [])
  
  return (
    <div>
      <Webcam ref={webcamRef} mirrored style={props.style} />
      <canvas ref={canvasRef} style={props.style} />
    </div>
  )
}

export default Camera
