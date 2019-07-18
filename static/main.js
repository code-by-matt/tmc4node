// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var marquee = document.getElementById("marquee");
  var resetBtn = document.getElementById("reset");
  var myNameDiv = document.getElementById("my-name");
  var myNameInput = document.getElementById("my-name-input");
  var theirNameDiv = document.getElementById("their-name");
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", game.id);
  socket.emit("sync pls", game.id);
  squares.tryDraw(game);

  // When enter is pressed in the name input, change the input to a div and emit a "my name" message.
  myNameInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter" && myNameInput.value != "") {
      myNameDiv.textContent = myNameInput.value;
      myNameDiv.style.display = "flex";
      myNameInput.style.display = "none";
      socket.emit("my name", game, myNameInput.value);
    }
    if (myNameDiv.textContent != "" && theirNameDiv.textContent != "") {
      if (Math.random() > 0.5) {
        game.red = myNameDiv.textContent;
        game.blu = theirNameDiv.textContent;
      }
      else {
        game.red = theirNameDiv.textContent;
        game.blu = myNameDiv.textContent;
      }
      logic.init(game);
      socket.emit("my game", game);
      setTimeout(function() {
        squares.tryDraw(game);
        wobbly.start(timer);
      }, 3000);
    }
  });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = squares.getCol(event);
    if (wobbly.isRunning(timer) && game.openRows[col] < 6 && !game.isOver) boardImg.style.cursor = "pointer";
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = squares.getCol(event);
    if (wobbly.isRunning(timer) && game.openRows[col] < 6 && !game.isOver) {
      logic.update(game, col);
      socket.emit("update game request", game);
    }
  });

  // When reset is clicked, reset game and send reset request.
  resetBtn.addEventListener("click", function() {
    logic.init(game);
    socket.emit("reset request", game);
  });

  // Disconnect before unload.
  window.addEventListener("beforeunload", function() {
    socket.emit("leave room", game.id);
  });

  socket.on("their name", function(senderName) {
    theirNameDiv.textContent = senderName;
  });

  socket.on("their game", function(senderGame) {
    game = senderGame;
    setTimeout(function() {
      squares.tryDraw(game);
      wobbly.start(timer);
    }, 3000);
  });

  // This handler is triggered when your opponent is requesting a sync.
  socket.on("sync pls", function(id) {
    socket.emit("here ya go", game, myNameDiv.textContent, theirNameDiv.textContent);
  });

  // This handler is triggered when you receive a sync from your opponent.
  socket.on("here ya go", function(senderGame, senderName, receiverName) {
    theirNameDiv.textContent = senderName;
    if (receiverName != "") {
      myNameDiv.textContent = receiverName;
      myNameDiv.style.display = "flex";
      myNameInput.style.display = "none";
    }
    game = senderGame;
    squares.tryDraw(game);
  });
  
  socket.on("reset response", function(newGame) {
    wobbly.stop(timer);
    console.log("timer stopped!");
    // Update game, make all the color squares look right.
    game = newGame;
    squares.tryDraw(game);
  });

  socket.on("start response", function() {
    wobbly.start(timer);
  });

  socket.on("game response", function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    squares.tryDraw(game);
    // Make the marquee look right.
    if (game.isOver) {
      if (game.history.slice(-3, -2) == "r") marquee.textContent = "Red wins by connection!";
      else marquee.textContent = "Blue wins by connection!";
      wobbly.stop(timer);
    }
    // Flip the timer if necessary.
    if (game.history == "") wobbly.stop(timer);
    else if (game.history.slice(-3, -2) != game.future[0]) wobbly.flip(timer);
    console.log(socket.id);
  });
})();
