const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

function drawHand(landmarks, ctx) {
  for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
    let finger = Object.keys(fingerJoints)[j];
    //  Loop through pairs of joints
    for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
      // Get pairs of joints
      const firstJointIndex = fingerJoints[finger][k];
      const secondJointIndex = fingerJoints[finger][k + 1];
      drawPath(landmarks[firstJointIndex], landmarks[secondJointIndex], ctx);
    }
  }

  landmarks.forEach((landmark) => {
    drawPoint(landmark[0], landmark[1], ctx);
  })
}

function drawPoint(x, y, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();
}

function drawPath(from, to, ctx) {
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 4;
  ctx.stroke();
}

export {drawHand};