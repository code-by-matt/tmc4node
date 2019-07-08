// We use an IIFE to protect our script from evil outside forces.
(function() {
  // The squares object holds document elements that pertain to squares.
  var squares = {
    boardCan: document.getElementById("board-canvas"),
    boardImg: document.getElementById("board-img"),
    futureCan: document.getElementById("future-canvas"),
    futureImg: document.getElementById("future-img"),
  };

  // The timer object holds document elements and numbers that pertain to the timer.
  var timer = {
    startBtn: document.getElementById("start"),
    resetBtn: document.getElementById("reset"),
    redDiv: document.getElementById("red-div"),
    bluDiv: document.getElementById("blu-div"),
    redStart: Number.NEGATIVE_INFINITY, // The start time of the most recent red move/pair of moves.
    bluStart: Number.NEGATIVE_INFINITY, // The start time of the most recent blu move/pair of moves.
    redTime: 0, // The time elapsed for red, NOT INCLUDING THE ACTIVE TIMING INTERVAL.
    bluTime: 0, // The time elapsed for blu, NOT INCLUDING THE ACTIVE TIMING INTERVAL.
    handle: 0, // This integer is zero iff the timer is not running.
  };

  // The game variable contains the data that we wish to share through a WebSocket.
  var game;

  // Establish websocket connection and request game from server.
  // Requests go from client to server, responses go from server to client.
  var socket = io();
  socket.emit('game request');

  // Change cursor style when appropriate.
  squares.boardImg.addEventListener("mousemove",  function(event) {
    var col = getCol(squares, event);
    if (game.openRows[col] < 6 && !game.isGameOver) {
      squares.boardImg.style.cursor = "pointer";
    }
    else {
      squares.boardImg.style.cursor = "default";
    }
  });

  // When start is clicked, send start request.
  timer.startBtn.addEventListener("click", function() {
    socket.emit('start request');
  });

  // When reset is clicked, reset game and send reset request.
  timer.resetBtn.addEventListener("click", function() {
    resetGame(game);
    socket.emit('reset request', game);
  });

  // When a valid move is made, update game and send move request.
  squares.boardImg.addEventListener("click", function(event) {
    var col = getCol(squares, event);
    if (game.openRows[col] < 6 && !game.isGameOver) {
      updateGame(game, col);
      socket.emit('move request', game);
    }
  });

  socket.on('game response', function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    createBoard(squares, game);
    createFuture(squares, game);
  });

  socket.on('reset response', function(newGame) {
    stop(timer);
    console.log("timer stopped!");
    // Update game, make all the color squares look right.
    game = newGame;
    createBoard(squares, game);
    createFuture(squares, game);
  });

  socket.on('start response', function() {
    start(timer);
  });

  socket.on('move response', function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    createBoard(squares, game);
    createFuture(squares, game);
    // Make the marquee look right.
    var marquee;
    if (game.isGameOver) {
      if (game.history.slice(-3, -2) == "r") marquee = "Red wins by connection!";
      else marquee = "Blue wins by connection!";
    }
    else {
      marquee = "Thue-Morse Connect Four";
    }
    document.getElementById("marquee").innerHTML = marquee;
    // Flip the timer if necessary.
    if (game.history == '') stop(timer);
    else if (game.history.slice(-3, -2) != game.future[0]) flip(timer);
  });

  // THESE FUNCTIONS DEAL WITH CHANGING THE GAME DATA ––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  function thueMorse(n) {
    var count = 0
    while (n != 0) {
      n = n & (n - 1);
      count++;
    }
    return count % 2;
  }

  function resetGame(game) {
    game.history = '';
    game.openRows = [0, 0, 0, 0, 0, 0, 0];
    game.firstTurn = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
    // game.firstTurn = 0;
    game.currentTurn = game.firstTurn;
    game.future = '';
    game.isGameOver = false;
    for (let i = 0; i < 8; i++) {
      // XORing with thueMorse(game.firstTurn) ensures that the first player is always red.
      if (thueMorse(game.firstTurn) ^ thueMorse(game.currentTurn + i) == 0) {
        game.future += "r";
      }
      else {
        game.future += "b";
      }
    }
  }

  function updateGame(game, col) {
    var row = game.openRows[col];
    game.history += game.future[0] + col + row;
    game.openRows[col] += 1;
    game.currentTurn += 1;
    game.future = '';
    for (let i = 0; i < 8; i++) {
      if (thueMorse(game.firstTurn) ^ thueMorse(game.currentTurn + i) == 0) game.future += "r";
      else game.future += "b";
    }
    game.isGameOver = isWin(game);
  }

  // THESE FUNCTIONS DEAL WITH READING THE GAME DATA –––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  function getCol(squares, event) {
    return Math.floor((7 * (event.pageX - squares.boardImg.offsetLeft))/squares.boardImg.offsetWidth);
  }

  function count(game, up, right) {
    var color = game.history.slice(-3, -2);
    var col = parseInt(game.history.slice(-2, -1));
    var row = parseInt(game.history.slice(-1));
    var count = 0;
    var move = color + col + row
    while (game.history.includes(move)) {
      col += right;
      row += up;
      move = color + col + row;
      count++;
    }
    return count;
  }

  function isWin(game) {
    var hori = count(game, 0, -1) + count(game, 0, 1) - 1;
    var vert = count(game, -1, 0) + count(game, 1, 0) - 1;
    var diag = count(game, 1, -1) + count(game, -1, 1) - 1;
    var antd = count(game, 1, 1) + count(game, -1, -1) - 1;
    // console.log("horizontal: " + hori);
    // console.log("vertical: " + vert);
    // console.log("diagonal: " + diag);
    // console.log("anti-diagonal: " + antd);
    if (hori >=4 | vert >= 4 | diag >= 4 | antd >= 4) {
      return true;
    }
    else return false;
  }

  // THESE FUNCTIONS DEAL WITH CREATING THE VISUALS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  function createBoard(squares, game) {
    var ctx = squares.boardCan.getContext("2d");
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
    squares.boardImg.src = squares.boardCan.toDataURL();
  }

  function createFuture(squares, game) {
    var ctx = squares.futureCan.getContext("2d");
    // Wipe out the previous future.
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1600, 200);
    // Draw the future, ooh!
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
    squares.futureImg.src = squares.futureCan.toDataURL();
  }

  // THESE FUNCTIONS DEAL WITH TIMING ——————————————––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  function convert(ms) {
    var min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    var sec = Math.floor((ms % (1000 * 60)) / 1000);
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    return min + ':' + sec;
  }

  function times(timer) {
    var redString, bluString;
    var currentTime = new Date().getTime();
    // Red is in the middle of making a move.
    if (timer.redStart > timer.bluStart) {
      redString = convert(timer.redTime + currentTime - timer.redStart);
      bluString = convert(timer.bluTime);
    }
    // Blu is in the middle of making a move.
    else {
      redString = convert(timer.redTime);
      bluString = convert(timer.bluTime + currentTime - timer.bluStart);
    }
    return [redString, bluString];
  }

  function start(timer) {
    var currentTime = new Date().getTime();
    timer.redStart = currentTime;
    timer.handle = setInterval(function() {
      var yeet = times(timer);
      timer.redDiv.innerHTML = yeet[0];
      timer.bluDiv.innerHTML = yeet[1];
      console.log("running");
    }, 100);
    console.log("start");
  }

  function flip(timer) {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (timer.redStart > timer.bluStart) {
      timer.redTime += currentTime - timer.redStart;
      timer.bluStart = currentTime;
    }
    // Blu is completing its move.
    else if (timer.redStart < timer.bluStart) {
      timer.bluTime += currentTime - timer.bluStart;
      timer.redStart = currentTime;
    }
    // Hopefully timer.redStart and timer.bluStart are never equal...
    console.log("flip");
  }

  function stop(timer) {
    clearInterval(timer.handle);
    timer.handle = 0;
    timer.redStart = Number.NEGATIVE_INFINITY;
    timer.bluStart = Number.NEGATIVE_INFINITY;
    timer.redTime = 0;
    timer.bluTime = 0;
    timer.redDiv.innerHTML = "00:00";
    timer.bluDiv.innerHTML = "00:00";
  }
})();
