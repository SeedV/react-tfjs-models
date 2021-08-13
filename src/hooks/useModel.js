import { useEffect, useRef } from "react"
import * as handpose from '@tensorflow-models/handpose';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

tfjsWasm.setWasmPaths({
  'tfjs-backend-wasm.wasm': `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
        tfjsWasm.version_wasm}/dist/tfjs-backend-wasm.wasm`,
  'tfjs-backend-wasm-simd.wasm': `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
        tfjsWasm.version_wasm}/dist/tfjs-backend-wasm-simd.wasm`,
  'tfjs-backend-wasm-threaded-simd.wasm': `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
        tfjsWasm.version_wasm}/dist/tfjs-backend-wasm-threaded-simd.wasm`,
  });

const useModel = (props) => {
  const { backend } = props;
  const modelRef = useRef(null);

  function setBackend(backend) {
    tf.setBackend(backend).then(
      () => {
        if (!tf.env().getAsync('WASM_HAS_SIMD_SUPPORT') && backend === "wasm") {
          console.warn("The backend is set to WebAssembly and SIMD support is turned off.\nThis could bottleneck your performance greatly, thus to prevent this enable SIMD Support in chrome://flags");
        }    
      }
    );
  }
  
  useEffect(() => {
    setBackend(backend);
    handpose.load().then((model) => {
      modelRef.current = model;
    });
  }, [backend]);
  
  return modelRef;
}

export default useModel;