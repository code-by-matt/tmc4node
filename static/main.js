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
  var d = display();
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  socket.emit("sync pls", id);
  d.tryDraw(game);

  // When enter is pressed in the name input, change the input to a div and emit a "my name" message.
  myNameInput.addEventListener("keyup", function(event) {
    if (event.key == "Enter" && myNameInput.value != "") {
      d.writeMe();
      socket.emit("my name", id, myNameDiv.textContent);
      if (myNameDiv.textContent != "" && theirNameDiv.textContent != "") {
        socket.emit("my countdown", id);
        d.countdown();
        setTimeout(function() {
          l.init(game, myNameDiv.textContent, theirNameDiv.textContent);
          socket.emit("my game", id, game);
          d.tryDraw(game);
        }, 3000);
      }
    }
  });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = d.getCol(event);
    if (l.isRunning(game) && game.openRows[col] < 6 && !game.isOver) boardImg.style.cursor = "pointer";
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = d.getCol(event);
    if (l.isRunning(game) && game.openRows[col] < 6 && !game.isOver) {
      l.update(game, col);
      socket.emit("my game", id, game);
      d.tryDraw(game);
    }
  });

  // When reset is clicked, reset game and send reset request.
  resetBtn.addEventListener("click", function() {
    l.init(game);
    socket.emit("reset request", game);
  });

  // Disconnect before unload.
  window.addEventListener("beforeunload", function() {
    socket.emit("leave room", id);
  });

  socket.on("their name", function(senderName) {
    d.writeThem(senderName);
  });

  socket.on("their countdown", function() {
    d.countdown();
  });

  socket.on("their game", function(senderGame) {
    game = senderGame;
    d.tryDraw(game);
    if (l.isRunning(game)) {
      l.run(game);
    }
  });

  // This handler is triggered when your opponent is requesting a sync.
  socket.on("sync pls", function() {
    socket.emit("here ya go", id, game, myNameDiv.textContent, theirNameDiv.textContent);
  });

  // This handler is triggered when you receive a sync from your opponent.
  socket.on("here ya go", function(senderGame, senderName, receiverName) {
    theirNameDiv.textContent = senderName;
    if (receiverName != "") {
      myNameDiv.textContent = receiverName;
      myNameDiv.style.display = "block";
      myNameInput.style.display = "none";
    }
    game = senderGame;
    d.tryDraw(game);
    if (l.isRunning(game)) {
      l.run(game);
    }
  });
})();
