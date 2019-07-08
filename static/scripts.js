// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Initialize timer variables.
  var redStart, bluStart = Number.NEGATIVE_INFINITY; // The start time (in ms) of each color's most recent move/pair of moves.
  var redTime, bluTime = 0; // The time elapsed (in ms) for each color, NOT INCLUDING THE ACTIVE TIMING INTERVAL.
  var handle = 0; // This is a reference to the repeating code that runs the timer. It is zero when the timer is stopped.

  // Grab lots of document elements.
  var futureCan = document.getElementById("future-canvas"); // Future and board are drawn in these (invisbile) canvas elements...
  var boardCan = document.getElementById("board-canvas");
  var futureImg = document.getElementById("future-img"); // ...then they are displayed in these image elements.
  var boardImg = document.getElementById("board-img");
  var startBtn = document.getElementById("start"); // Timer start and reset buttons, duh.
  var resetBtn = document.getElementById("reset");
  var redDiv = document.getElementById("red-div"); // Times are displayed in these two divs.
  var bluDiv = document.getElementById("blu-div");
  var joinBtn = document.getElementById("join");
  var statDiv = document.getElementById("status");
  var popDiv = document.getElementById("pop");

  // Establish a websocket connection and join the room. Requests go from client to server, responses go from server to client.
  var socket = io();

  // The game data gets updated when the client receives a join response.
  var game = null;

  // When the join button is clicked, send a join request along with this socket's id.
  // This is the only event listener that is attached before a client joins the room.
  joinBtn.addEventListener("click", function() {
    socket.emit('join request', socket.id);
  });

  function attachListeners() {
    // Change cursor style when appropriate.
    boardImg.addEventListener("mousemove",  function(event) {
      var col = getCol(event);
      if (game.openRows[col] < 6 && !game.isGameOver) {
        boardImg.style.cursor = "pointer";
      }
      else {
        boardImg.style.cursor = "default";
      }
    });
    // When a valid move is made, update game and send move request.
    boardImg.addEventListener("click", function(event) {
      var col = getCol(event);
      if (game.openRows[col] < 6 && !game.isGameOver) {
        updateGame(col);
        socket.emit('move request', game);
      }
    });
    // When start is clicked, send start request.
    startBtn.addEventListener("click", function() {
      socket.emit('start request');
    });
    // When reset is clicked, reset game and send reset request.
    resetBtn.addEventListener("click", function() {
      resetGame();
      socket.emit('reset request', game);
    });
  }

  socket.on('reset response', function(newGame) {
    stop();
    console.log("timer stopped!");
    // Update game, make all the color squares look right.
    game = newGame;
    createBoard();
    createFuture();
  });

  socket.on('start response', function() {
    start();
  });

  socket.on('join response', function(newGame) {
    statDiv.innerHTML = "You ARE in the room."
    game = newGame;
    createBoard();
    createFuture();
    attachListeners();
  });

  socket.on('population response', function(n) {
    popDiv.innerHTML = "Room contains " + n + ".";
  });

  socket.on('move response', function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    createBoard();
    createFuture();
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
    if (game.history == '') stop();
    else if (game.history.slice(-3, -2) != game.future[0]) flip();
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

  function resetGame() {
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

  function updateGame(col) {
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

  function getCol(event) {
    return Math.floor((7 * (event.pageX - boardImg.offsetLeft))/boardImg.offsetWidth);
  }

  function count(up, right) {
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

  function isWin() {
    var hori = count(0, -1) + count(0, 1) - 1;
    var vert = count(-1, 0) + count(1, 0) - 1;
    var diag = count(1, -1) + count(-1, 1) - 1;
    var antd = count(1, 1) + count(-1, -1) - 1;
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

  function createBoard() {
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

  function createFuture() {
    var ctx = futureCan.getContext("2d");
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
    futureImg.src = futureCan.toDataURL();
  }

  // THESE FUNCTIONS DEAL WITH TIMING ——————————————––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  function convert(ms) {
    var min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    var sec = Math.floor((ms % (1000 * 60)) / 1000);
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    return min + ':' + sec;
  }

  function times() {
    var redString, bluString;
    var currentTime = new Date().getTime();
    // Red is in the middle of making a move.
    if (redStart > bluStart) {
      redString = convert(redTime + currentTime - redStart);
      bluString = convert(bluTime);
    }
    // Blu is in the middle of making a move.
    else {
      redString = convert(redTime);
      bluString = convert(bluTime + currentTime - bluStart);
    }
    return [redString, bluString];
  }

  function start() {
    var currentTime = new Date().getTime();
    redStart = currentTime;
    handle = setInterval(function() {
      var yeet = times();
      redDiv.innerHTML = yeet[0];
      bluDiv.innerHTML = yeet[1];
      console.log("running");
    }, 100);
    console.log("start");
  }

  function flip() {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (redStart > bluStart) {
      redTime += currentTime - redStart;
      bluStart = currentTime;
    }
    // Blu is completing its move.
    else if (redStart < bluStart) {
      bluTime += currentTime - bluStart;
      redStart = currentTime;
    }
    // Hopefully redStart and bluStart are never equal...
    console.log("flip");
  }

  function stop() {
    clearInterval(handle);
    handle = 0;
    redStart = Number.NEGATIVE_INFINITY;
    bluStart = Number.NEGATIVE_INFINITY;
    redTime = 0;
    bluTime = 0;
    redDiv.innerHTML = "00:00";
    bluDiv.innerHTML = "00:00";
  }
})();
