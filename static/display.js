// Here are the functions that deal with displaying information.
var display = function() {

  // Grab some "private" document elements.
  var futureCan = document.getElementById("future-canvas"); // Future and board are drawn in these (invisbile) canvas elements...
  var boardCan = document.getElementById("board-canvas");
  var futureImg = document.getElementById("future-img"); // ...then they are displayed in these image elements.
  var boardImg = document.getElementById("board-img");
  var myColor = document.getElementById("my-color");
  var theirColor = document.getElementById("their-color");
  var myNameDiv = document.getElementById("my-name");
  var myNameInput = document.getElementById("my-name-input");
  var theirNameDiv = document.getElementById("their-name");

  // Calculates the column in which a player clicked (0 thru 6).
  function getCol(event) {
    return Math.floor((7 * (event.pageX - boardImg.offsetLeft))/boardImg.offsetWidth);
  }

  // Writes your own name.
  function writeMe() {
    if (myNameInput.value == theirNameDiv.textContent) {
      myNameDiv.textContent = myNameInput.value + " 2";
    }
    else {
      myNameDiv.textContent = myNameInput.value;
    }
    myNameDiv.style.display = "block";
    myNameInput.style.display = "none";
  }

  // Writes your opponent's name.
  function writeThem(name) {
    theirNameDiv.textContent = name;
  }

  // Assigns colors to the players.
  function drawColors(game) {
    if (game.red == myNameDiv.textContent && game.blu == theirNameDiv.textContent) {
      myColor.style.backgroundColor = "#DC3545";
      theirColor.style.backgroundColor = "#007BFF";
    }
    else if (game.blu == myNameDiv.textContent && game.red == theirNameDiv.textContent) {
      myColor.style.backgroundColor = "#007BFF";
      theirColor.style.backgroundColor = "#DC3545";
    }
  }

  function drawFuture(game) {
    var ctx = futureCan.getContext("2d");
    // // Wipe out the previous future.
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, 1600, 200);
    // Draw the future.
    for (let i = 0; i < 8; i++) {
      if (game.future[i] == "r") {
        ctx.fillStyle = "#DC3545";
        ctx.fillRect((200 * i), 0, 200, 200);
      }
      else {
        ctx.fillStyle = "#007BFF";
        ctx.fillRect((200 * i), 0, 200, 200);
      }
    }
    // Put the canvas into the image.
    futureImg.src = futureCan.toDataURL();
  }

  function drawBoard(game) {
    var ctx = boardCan.getContext("2d");
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
    for (let i = 0; i < game.history.length; i += 3) {
      let color = game.history.charAt(i);
      let col = game.history.charAt(i + 1);
      let row = game.history.charAt(i + 2);
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
    boardImg.src = boardCan.toDataURL();
  }

  function tryDraw(game) {
    if (game.red != undefined && game.blu != undefined) drawColors(game);
    if (game.future != undefined) drawFuture(game);
    if (game.history != undefined) drawBoard(game);
  }

  return {
    getCol: getCol,
    writeMe: writeMe,
    writeThem: writeThem,
    tryDraw: tryDraw,
  };
};