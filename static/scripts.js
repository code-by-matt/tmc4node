// THESE FUNCTIONS DEAL WITH CHANGING THE GAME DATA ––––––––––––––––––––––––––––––––––––––––––––––––––––––––

function color(turnNumber) {
  var count = 0
  while (turnNumber != 0) {
    turnNumber = turnNumber & (turnNumber - 1);
    count++;
  }
  return count % 2;
}

function resetGameStats(gameStats) {
  gameStats.history = '';
  gameStats.openRows = [0, 0, 0, 0, 0, 0, 0];
  // gameStats.turnNumber = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
  gameStats.turnNumber = 0;
  gameStats.future = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 8; i++) {
    gameStats.future[i] = color(gameStats.turnNumber + i);
  }
}

function updateGameStats(gameStats, col) {
  // Update history.
  var row = gameStats.openRows[col];
  if (gameStats.future[0] == 0) {
    gameStats.history += "r" + col + row;
  }
  else {
    gameStats.history += "b" + col + row;
  }
  // Update openRows.
  gameStats.openRows[col] += 1;
  // Update turnNumber.
  gameStats.turnNumber += 1;
  // Update future.
  for (let i = 0; i < 8; i++) {
    gameStats.future[i] = color(gameStats.turnNumber + i);
  }
}

// THESE FUNCTIONS DEAL WITH CREATING THE VISUALS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

function createBoard(boardImg, boardCanvas, gameStats) {
  var ctx = boardCanvas.getContext("2d");
  // Wipe out the previous board.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 1400, 1200);
  // Draw gray squares.
  ctx.fillStyle = "#D8D8D8";
  for (let i = 0; i < 7; i += 1) {
    for (let j = 0; j < 6; j += 1) {
      if ((i + j) % 2 == 1) {
        ctx.fillRect(200*i, 200*j, 200, 200);
      }
    }
  }
  // Draw game history.
  ctx.font = "80px Arial";
  for (let i = 0; i < gameStats.history.length; i += 3) {
    let color = gameStats.history.charAt(i);
    let col = gameStats.history.charAt(i + 1);
    let row = gameStats.history.charAt(i + 2);
    let number = (i / 3) + 1;
    if (color == "b") {
      ctx.fillStyle = "#007BFF";
      ctx.fillRect((200 * col), (200 * (5 - row)), 200, 200);
    }
    else if (color == "r") {
      ctx.fillStyle = "#DC3545";
      ctx.fillRect((200 * col), (200 * (5 - row)), 200, 200);
    }
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number, (200 * col) + 100, (200 * (5 - row)) + 100);
  }
  // Draw lines.
  ctx.strokeStyle = "#D8D8D8";
  ctx.lineWidth = 3;
  for (let i = 1; i < 7; i += 1) {
      ctx.moveTo(200*i, 0);
      ctx.lineTo(200*i, 1200);
      ctx.stroke();
  }
  for (let i = 1; i < 6; i += 1) {
      ctx.moveTo(0, 200*i);
      ctx.lineTo(1400, 200*i);
      ctx.stroke();
  }
  // Put the canvas into the image.
  boardImg.src = boardCanvas.toDataURL();
}

function createCounter(counterImg, counterCanvas, gameStats) {
  var ctx = counterCanvas.getContext("2d");
  // Wipe out the previous counter.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 1600, 200);
  // Draw the future, ooh!
  for (let i = 0; i < 8; i++) {
    if (gameStats.future[i] == 0) {
      ctx.fillStyle = "#DC3545";
      ctx.fillRect((200 * i), 0, 200, 200);
    }
    else {
      ctx.fillStyle = "#007BFF";
      ctx.fillRect((200 * i), 0, 200, 200);
    }
  }
  // Put the canvas into the image.
  counterImg.src = counterCanvas.toDataURL();
}

function getCol(boardImg, event) {
  return Math.floor((7 * (event.pageX - boardImg.offsetLeft))/boardImg.offsetWidth);
}
