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
  var l = logic(game);
  var d = display(game);
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  socket.emit("sync pls", id);
  d.tryDraw();

  // When enter is pressed in the name input, change the input to a div and emit a "my name" message.
  myNameInput.addEventListener("change", function(event) {
    if (myNameInput.value != "") {
      d.writeMe(myNameInput.value);
      socket.emit("my name", id, myNameDiv.textContent);
      if (myNameDiv.textContent != "" && theirNameDiv.textContent != "") {
        socket.emit("my countdown", id);
        d.countdown();
        setTimeout(function() {
          l.init(myNameDiv.textContent, theirNameDiv.textContent);
          socket.emit("my game", id, game);
          d.tryDraw();
        }, 3000);
      }
    }
  });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = d.getCol(event);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (game.red == myNameDiv.textContent && game.future[0] == "r") {
        boardImg.style.cursor = "pointer";
      }
      else if (game.blu == myNameDiv.textContent && game.future[0] == "b") {
        boardImg.style.cursor = "pointer";
      }
      else boardImg.style.cursor = "default";
    }
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = d.getCol(event);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (game.red == myNameDiv.textContent && game.future[0] == "r") {
        l.update(col);
        socket.emit("my game", id, game);
        d.tryDraw();
      }
      else if (game.blu == myNameDiv.textContent && game.future[0] == "b") {
        l.update(col);
        socket.emit("my game", id, game);
        d.tryDraw();
      }
    }
  });

  // When reset is clicked, reset game and send reset request.
  // resetBtn.addEventListener("click", function() {
  //   l.init();
  //   socket.emit("reset request", game);
  // });

  // Custom event to help with testing.
  socket.on("room joined", function() {
    window.dispatchEvent(new Event("joined"));
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
    Object.assign(game, senderGame);
    d.tryDraw();
  });

  // This handler is triggered when your opponent is requesting a sync.
  socket.on("sync pls", function() {
    socket.emit("here ya go", id, game, myNameDiv.textContent, theirNameDiv.textContent);
  });

  // This handler is triggered when you receive a sync from your opponent.
  socket.on("here ya go", function(senderGame, senderName, receiverName) {
    d.writeThem(senderName);
    d.writeMe(receiverName);
    Object.assign(game, senderGame);
    d.tryDraw();
  });
})();
