# react-tfjs-models

`react-tfjs-models` is a set of components and utilities to create machine learning applications using
React. It's based on Google's [tensorflow tfjs models](https://github.com/tensorflow/tfjs-models), including
image classification, pose detection, face detection, body segmentation and more.

Comparing to integrating the underlying library, this project provides various supports for non-machine learning
experts to use these models in their Rect applications.

## React components hierarchy

`react-tfjs-models` has provided a more intuitive declarative syntax, rather than the traditional imperative
approach. An application to use `BlazePose` model to analyze each frame from a webcam stream would look like:

```jsx
<Camera ...>
  <BlazePose ...>
    <Animation />
  </BlazePose>
</Camera>
```

Generally speaking, a streaming based machine learning hierarchy would consist of an input layer, a model layer
and an output layer, and each layer has swappable components developed in `react-tfjs-models`, and can also be
implemented by application developers.

```jsx
<Input ...>
  <Model ...>
    <Output />
  </Model>
</Input>
```

### Input layer

The components in this layer generate a stream of images from input devices. It can be from a webcam or a video
extractor. This layer wraps the heavy lifting in setting up the HTML structure of using `<video>` and `<canvas>`
elements and convert the extracted frame into a Rect state.

### Model layer

The components in this layer are machine learning models provided by [`tfjs-models`]
(https://github.com/tensorflow/tfjs-models/).

This layer will also support model acceleration on webgl and wasm backend, if the model supports.

### Output layer

The components in this layer can be used to render the result. `react-tfjs-models` will provide some predefined
overlay debug UI, e.g. rendering the skeleton on the web frames, to help developers to understand model performance
and tweak the algorithms. It's also highly customizable to adopt to the real application need.

## Demos

This project provides a list of demos to show case how the components work. Please check out the `demos` folder.

| Demo | Description |
| ---- | ----------- |
| RockPaperScissors | a HandPose estimation demo of the classic game. |
| CartoonMirror | a BlazePose demo to recognize the pose from webcam, and control a 3D character to mimic the pose. |

## Development

```shell
# Install dependencies
yarn install

# Start demo server on http.
yarn start
```
