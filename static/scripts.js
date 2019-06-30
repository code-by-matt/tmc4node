function createBoard(board, canvas, gameStats) {
  var ctx = canvas.getContext("2d");
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
  board.src = canvas.toDataURL();
}

function getCol(board, event) {
  return Math.floor((7 * (event.pageX - board.offsetLeft))/board.offsetWidth);
}

function resetGameStats(gameStats) {
  gameStats.history = '';
  gameStats.isRedsTurn = Math.random() > 0.5;
  gameStats.openRows = [0, 0, 0, 0, 0, 0, 0];
  gameStats.turnNumber = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
}

function updateGameStats(gameStats, col) {
  // Update history.
  var row = gameStats.openRows[col];
  if (gameStats.isRedsTurn == true) {
    gameStats.history += "r" + col + row;
  }
  else {
    gameStats.history += "b" + col + row;
  }
  // Update openRows.
  gameStats.openRows[col] += 1;
  // Increment turnNumber while grabbing values that determine the next move's color.
  var current = (gameStats.turnNumber.toString(2).split('1').length - 1) % 2;
  gameStats.turnNumber += 1;
  var next = (gameStats.turnNumber.toString(2).split('1').length - 1) % 2;
  // Flip isRedsTurn if necessary.
  if (current != next) {
    gameStats.isRedsTurn = !gameStats.isRedsTurn;
  }
}
