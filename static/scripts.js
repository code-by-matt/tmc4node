// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var startBtn = document.getElementById("start");
  var resetBtn = document.getElementById("reset");

  // Make a blank game.
  var game = {id: sessionStorage.id};
  logic.reset(game);

  // Establish a websocket connection, send the blank game to the database, join the right room, display the game id.
  var socket = io();
  socket.emit('new game request', game);
  document.getElementById("id").innerHTML = game.id;

  function attachListeners() {
    // Change cursor style when appropriate.
    boardImg.addEventListener("mousemove",  function(event) {
      var col = squares.getCol(event);
      if (game.openRows[col] < 6 && !game.isGameOver) {
        boardImg.style.cursor = "pointer";
      }
      else {
        boardImg.style.cursor = "default";
      }
    });
    // When a valid move is made, update game and send move request.
    boardImg.addEventListener("click", function(event) {
      var col = squares.getCol(event);
      if (game.openRows[col] < 6 && !game.isGameOver) {
        logic.update(game, col);
        socket.emit('move request', game);
      }
    });
    // When start is clicked, send start request.
    startBtn.addEventListener("click", function() {
      socket.emit('start request');
    });
    // When reset is clicked, reset game and send reset request.
    resetBtn.addEventListener("click", function() {
      logic.reset(game);
      socket.emit('reset request', game);
    });
  }

  socket.on('reset response', function(newGame) {
    timer.stop();
    console.log("timer stopped!");
    // Update game, make all the color squares look right.
    game = newGame;
    squares.createBoard(game);
    squares.createFuture(game);
  });

  socket.on('start response', function() {
    timer.start();
  });

  // socket.on('join response', function(newGame) {
  //   statDiv.innerHTML = "You ARE in the room."
  //   game = newGame;
  //   squares.createBoard(game);
  //   squares.createFuture(game);
  //   attachListeners();
  // });

  socket.on('population response', function(n) {
    popDiv.innerHTML = "Room contains " + n + ".";
  });

  socket.on('move response', function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    squares.createBoard(game);
    squares.createFuture(game);
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
    if (game.history == '') timer.stop();
    else if (game.history.slice(-3, -2) != game.future[0]) timer.flip();
  });
})();
