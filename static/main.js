// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var marquee = document.getElementById("marquee");
  var resetBtn = document.getElementById("reset");
  var myNameDiv = document.getElementById("my-name");
  var myNameInput = document.getElementById("my-name-input");
  var theirNameDiv = document.getElementById("their-name");

  // Load some modules.
  var l = logic();
  var w = wobbly();
  var s = squares();
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", game.id);
  socket.emit("sync pls", game.id);
  s.tryDraw(game);

  // When enter is pressed in the name input, change the input to a div and emit a "my name" message.
  myNameInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter" && myNameInput.value != "") {
      myNameDiv.textContent = myNameInput.value;
      myNameDiv.style.display = "block";
      myNameInput.style.display = "none";
      socket.emit("my name", game, myNameInput.value);
    }
    if (myNameDiv.textContent != "" && theirNameDiv.textContent != "") {
      socket.emit("my countdown", game.id);
      w.countdown();
      setTimeout(function() {
        l.init(game);
        socket.emit("my game", game);
        s.tryDraw(game);
        w.start(timer);
        socket.emit("my timer", game.id, timer);
      }, 3000);
    }
  });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = s.getCol(event);
    if (w.isRunning(timer) && game.openRows[col] < 6 && !game.isOver) boardImg.style.cursor = "pointer";
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = s.getCol(event);
    if (w.isRunning(timer) && game.openRows[col] < 6 && !game.isOver) {
      l.update(game, col);
      socket.emit("my game", game);
      s.tryDraw(game);
    }
  });

  // When reset is clicked, reset game and send reset request.
  resetBtn.addEventListener("click", function() {
    l.init(game);
    socket.emit("reset request", game);
  });

  // Disconnect before unload.
  window.addEventListener("beforeunload", function() {
    socket.emit("leave room", game.id);
  });

  socket.on("their name", function(senderName) {
    theirNameDiv.textContent = senderName;
  });

  socket.on("their countdown", function() {
    w.countdown();
  });

  socket.on("their game", function(senderGame) {
    game = senderGame;
    s.tryDraw(game);
  });

  socket.on("their timer", function(senderTimer) {
    timer = senderTimer;
    if (w.isRunning(timer)) {
      w.start(timer);
    }
  });

  // This handler is triggered when your opponent is requesting a sync.
  socket.on("sync pls", function(id) {
    socket.emit("here ya go", game, timer, myNameDiv.textContent, theirNameDiv.textContent);
  });

  // This handler is triggered when you receive a sync from your opponent.
  socket.on("here ya go", function(senderGame, senderTimer, senderName, receiverName) {
    theirNameDiv.textContent = senderName;
    if (receiverName != "") {
      myNameDiv.textContent = receiverName;
      myNameDiv.style.display = "block";
      myNameInput.style.display = "none";
    }
    game = senderGame;
    s.tryDraw(game);
    timer = senderTimer;
    if (w.isRunning(timer)) {
      w.start(timer);
    }
  });
  
  socket.on("reset response", function(newGame) {
    w.stop(timer);
    console.log("timer stopped!");
    // Update game, make all the color squares look right.
    game = newGame;
    s.tryDraw(game);
  });

  socket.on("start response", function() {
    w.start(timer);
  });

  socket.on("game response", function(newGame) {
    // Update game, make all the color squares look right.
    game = newGame;
    s.tryDraw(game);
    // Make the marquee look right.
    if (game.isOver) {
      if (game.history.slice(-3, -2) == "r") marquee.textContent = "Red wins by connection!";
      else marquee.textContent = "Blue wins by connection!";
      w.stop(timer);
    }
    // Flip the timer if necessary.
    if (game.history == "") w.stop(timer);
    else if (game.history.slice(-3, -2) != game.future[0]) w.flip(timer);
    console.log(socket.id);
  });
})();
