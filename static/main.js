// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var marquee = document.getElementById("marquee");
  var startBtn = document.getElementById("start");
  var resetBtn = document.getElementById("reset");
  var myColor = document.getElementById("my-color");
  var myNameDiv = document.getElementById("my-name");
  var myNameInput = document.getElementById("my-name-input");
  var theirName = document.getElementById("their-name");
  var theirColor = document.getElementById("their-color");
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", game.id);
  socket.emit("sync pls", game.id);

  // When enter is pressed in the name input, change the input to a div and emit a "my name" message.
  myNameInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter" && myNameInput.value != "") {
      myNameDiv.textContent = myNameInput.value;
      myNameDiv.style.display = "flex";
      myNameInput.style.display = "none";
      socket.emit("my name", game.id, myNameInput.value);
    }
  });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = squares.getCol(event);
    if (timer.isRunning() && game.openRows[col] < 6 && !game.isOver) boardImg.style.cursor = "pointer";
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = squares.getCol(event);
    if (timer.isRunning() && game.openRows[col] < 6 && !game.isOver) {
      logic.update(game, col);
      socket.emit("update game request", game);
    }
  });

  // When start is clicked, send start request.
  startBtn.addEventListener("click", function() {
    socket.emit("start request");
  });

  // When reset is clicked, reset game and send reset request.
  resetBtn.addEventListener("click", function() {
    logic.reset(game);
    socket.emit("reset request", game);
  });

  socket.on("their name", function(name) {
    theirName.textContent = name;
  });

  // This handler is triggered when your opponent is requesting a sync.
  socket.on("sync pls", function(id) {
    socket.emit("here ya go", id, myNameDiv.textContent, theirName.textContent);
  });

  // This handler is triggered when you receive a sync from your opponent.
  socket.on("here ya go", function(senderName, receiverName) {
    theirName.textContent = senderName;
    if (receiverName != "") {
      myNameDiv.textContent = receiverName;
      myNameDiv.style.display = "flex";
      myNameInput.style.display = "none";
    }
  });
  
  socket.on("reset response", function(newGame) {
    timer.stop();
    console.log("timer stopped!");
    // Update game, make all the color squares look right.
    game = newGame;
    squares.drawBoard(game);
    squares.drawFuture(game);
  });

  socket.on("start response", function() {
    timer.start();
  });

  socket.on("game response", function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    squares.drawBoard(game);
    squares.drawFuture(game);
    // Make the marquee look right.
    if (game.isOver) {
      if (game.history.slice(-3, -2) == "r") marquee.textContent = "Red wins by connection!";
      else marquee.textContent = "Blue wins by connection!";
      timer.stop();
    }
    // Flip the timer if necessary.
    if (game.history == "") timer.stop();
    else if (game.history.slice(-3, -2) != game.future[0]) timer.flip();
    console.log(socket.id);
  });
})();
