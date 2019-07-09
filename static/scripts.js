// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var startBtn = document.getElementById("start");
  var resetBtn = document.getElementById("reset");

  // Establish a websocket connection.
  var socket = io();

  // Create a new game or join an existing game.
  var game = {};
  if (sessionStorage.id == null) {
    sessionStorage.id = Math.random().toString(36).substr(6);
    game.id = sessionStorage.id;
    logic.reset(game);
    socket.emit('new game request', game);
  }
  else {
    game.id = sessionStorage.id;
    socket.emit('join game request', game.id); 
  }
  document.getElementById("id").innerHTML = game.id;

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = squares.getCol(event);
    if (game.openRows[col] < 6 && !game.isOver) boardImg.style.cursor = "pointer";
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send move request.
  boardImg.addEventListener("click", function(event) {
    var col = squares.getCol(event);
    if (game.openRows[col] < 6 && !game.isOver) {
      logic.update(game, col);
      socket.emit('update game request', game);
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

  socket.on('game response', function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    squares.createBoard(game);
    squares.createFuture(game);
    // Make the marquee look right.
    var marquee;
    if (game.isOver) {
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
