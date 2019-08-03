// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var readyBtn = document.getElementById("ready");
  var myNamePanel = document.getElementById("my-name-panel");
  var theirNamePanel = document.getElementById("their-name-panel");
  var myName = document.getElementById("my-name");

  // Load some modules.
  var l = logic(game);
  var d = display(game);
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  // socket.emit("sync pls", id);
  d.tryDraw();

  var theyAreReady = false;

  // Handle events that happen in the start panel.
  document.getElementById("start-panel").addEventListener("change", function(event) {
    if (event.target.id == "my-name-panel") {
      socket.emit("my", "name", event.target.value, id);
    }
    else if (event.target.id == "ready") {
      socket.emit("my", "message", "ready", id);
    }
    else if (event.target.id == "one-min") {
      theyAreReady = false;
      socket.emit("my", "message", "one minute", id);
    }
    else if (event.target.id == "thr-min") {
      theyAreReady = false;
      socket.emit("my", "message", "three minutes", id);
    }
    else if (event.target.id == "ten-min") {
      theyAreReady = false;
      socket.emit("my", "message", "ten minutes", id);
    }
    else if (event.target.id == "inf-min") {
      theyAreReady = false;
      socket.emit("my", "message", "infinity minutes", id);
    }
    if (myNamePanel.value != "" && theirNamePanel.textContent != "" && readyBtn.checked && theyAreReady) {
      d.playAnimation();
      socket.emit("my", "message", "play", id);
      setTimeout(function() {
        l.init(myNamePanel.value, theirNamePanel.textContent);
        d.tryDraw();
        socket.emit("my", "game", game, id);
      }, 2000);
    }
  });

  // Handle socket stuff.
  socket.on("their", function(type, thing) {
    if (type == "message") {
      if (thing == "one minute") {
        document.getElementById("one-min").checked = true;
        document.getElementById("ready").checked = false;
      }
      else if (thing == "three minutes") {
        document.getElementById("thr-min").checked = true;
        document.getElementById("ready").checked = false;
      }
      else if (thing == "ten minutes") {
        document.getElementById("ten-min").checked = true;
        document.getElementById("ready").checked = false;
      }
      else if (thing == "infinity minutes") {
        document.getElementById("inf-min").checked = true;
        document.getElementById("ready").checked = false;
      }
      else if (thing == "ready") {
        theyAreReady = !theyAreReady;
        console.log(theyAreReady);
      }
      else if (thing == "play") {
        d.playAnimation();
      }
    }
    else if (type == "name") {
      document.getElementById("their-name-panel").textContent = thing;
    }
    else if (type == "game") {
      Object.assign(game, thing);
      d.tryDraw();
    }
  });

  // // When enter is pressed in the name input, change the input to a div and emit a "my name" message.
  // myNamePanel.addEventListener("input", function(event) {
  //   socket.emit("my name", id, myNamePanel.value);
  //   // if (myNameInput.value != "") {
  //   //   d.writeMe(myNameInput.value);
  //   //   socket.emit("my name", id, myNameDiv.textContent);
  //   //   if (myNameDiv.textContent != "" && theirNameDiv.textContent != "") {
  //   //     socket.emit("countdown", id);
  //   //     d.countdown();
  //   //     setTimeout(function() {
  //   //       l.init(myNameDiv.textContent, theirNameDiv.textContent);
  //   //       socket.emit("my game", id, game);
  //   //       d.tryDraw();
  //   //     }, 3000);
  //   //   }
  //   // }
  // });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = d.getCol(event);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (game.red == myName.textContent && game.future[0] == "r") {
        boardImg.style.cursor = "pointer";
      }
      else if (game.blu == myName.textContent && game.future[0] == "b") {
        boardImg.style.cursor = "pointer";
      }
      else boardImg.style.cursor = "default";
    }
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = d.getCol(event);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (game.red == myName.textContent && game.future[0] == "r") {
        l.update(col);
        socket.emit("my game", id, game);
        d.tryDraw();
      }
      else if (game.blu == myName.textContent && game.future[0] == "b") {
        l.update(col);
        socket.emit("my game", id, game);
        d.tryDraw();
      }
    }
  });

  // When reset is clicked, reset game and send reset request.
  readyBtn.addEventListener("change", function() {
    // if (readyBtn.checked && theyAreReady) {
    //   socket.emit("countdown", id);
    //   d.countdown();
    //   setTimeout(function() {
    //     l.init(myNameDiv.textContent, theirNameDiv.textContent);
    //     socket.emit("my game", id, game);
    //     d.tryDraw();
    //   }, 3000);
    // }
    // if (game.isOver) {
    //   socket.emit("countdown", id);
    //   d.countdown();
    //   setTimeout(function() {
    //     l.init(myNameDiv.textContent, theirNameDiv.textContent);
    //     socket.emit("my game", id, game);
    //     d.tryDraw();
    //   }, 3000);
    // }
  });

  // Disconnect before unload.
  window.addEventListener("beforeunload", function() {
    socket.emit("leave room", id);
  });

  socket.on("countdown", function() {
    d.countdown();
  });

  socket.on("their game", function(senderGame) {
    Object.assign(game, senderGame);
    d.tryDraw();
  });

  // This handler is triggered when your opponent is requesting a sync.
  socket.on("sync pls", function() {
    socket.emit("here ya go", id, game, myNamePanel.value, theirNamePanel.textContent);
  });

  // This handler is triggered when you receive a sync from your opponent.
  // socket.on("here ya go", function(senderGame, senderName, receiverName) {
  //   d.writeThem(senderName);
  //   d.writeMe(receiverName);
  //   // Object.assign(game, senderGame);
  //   // d.tryDraw();
  // });
})();
