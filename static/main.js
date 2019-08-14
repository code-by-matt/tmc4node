// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var startPanel = document.getElementById("start");
  var playPanel = document.getElementById("play");
  var rematchBtn = document.getElementById("rematch-btn");
  var boardDiv = document.getElementById("board-div");
  var controls = document.getElementById("controls");

  // Create a game and other pertinent variables.
  var game = gameModule();
  var handle = {val: 0};
  var showNumbers = false;
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  socket.on("room joined", function() {
    document.querySelector("#loading").style.display = "none";
    if (first) {
      show(game.stats, showNumbers, handle);
    }
    else {
      socket.emit("my", "message", "sync", id);
    }
  });

  // Uncheck ready if you click your name input.
  startPanel.querySelector(".name").addEventListener("click", function(event) {
    game.stats.iAmReady = false;
    show(game.stats, showNumbers, handle);
    socket.emit("my", "game stats", game.stats, id);
  });

  // Handle events that happen in the start panel.
  startPanel.addEventListener("change", function(event) {

    // Update pre-start properties.
    if (event.target.className == "name") {
      game.stats.myName = event.target.value;
    }
    else if (event.target.id == "ready") {
      game.stats.iAmReady = !game.stats.iAmReady;
    }
    else if (event.target.id == "one-min") {
      game.stats.timeControl = 1;
      game.stats.iAmReady = false;
      game.stats.theyAreReady = false;
    }
    else if (event.target.id == "thr-min") {
      game.stats.timeControl = 3;
      game.stats.iAmReady = false;
      game.stats.theyAreReady = false;
    }
    else if (event.target.id == "ten-min") {
      game.stats.timeControl = 10;
      game.stats.iAmReady = false;
      game.stats.theyAreReady = false;
    }
    else if (event.target.id == "inf-min") {
      game.stats.timeControl = -1;
      game.stats.iAmReady = false;
      game.stats.theyAreReady = false;
    }

    // If everything's ready, start the game, show the play animation, and listen for timeouts.
    if (game.isReadyToStart()) {
      game.start();
      playPanel.style.display = "flex";
      setTimeout(function() {
        playPanel.style.display = "none";
      }, 2000);
      socket.emit("my", "message", "play animation", id);
      // Keep an eye out for timeouts.
      var wao = setInterval(function() {
        if (controls.querySelector("#my-time").textContent == "00:00" || controls.querySelector("#their-time").textContent == "00:00") {
          clearInterval(wao);
          game.timeout();
          show(game.stats, showNumbers, handle);
          socket.emit("my", "game stats", game.stats, id);
        }
      }, 100);
    }

    // Regardless of the game state, we show the game and emit the game stats.
    show(game.stats, showNumbers, handle);
    socket.emit("my", "game stats", game.stats, id);
  });

  // Make start panel buttons space-bar accessible.
  startPanel.addEventListener("keypress", function(event) {
    if (event.keyCode == 32) {
      if (event.target.getAttribute("for") == "one-min" || event.target.getAttribute("for") == "thr-min" || event.target.getAttribute("for") == "ten-min" || event.target.getAttribute("for") == "inf-min" || event.target.getAttribute("for") == "ready") {
        event.target.click();
      }
    }
  });

  // Calculates the column in which a player clicked (0 thru 6).
  function getCol(event) {
    return Math.floor((7 * (event.pageX - boardDiv.offsetLeft))/boardDiv.offsetWidth);
  }

  // Change cursor style when appropriate.
  boardDiv.addEventListener("mousemove",  function(event) {
    event.target.style.cursor = "default";
    var col = getCol(event);
    if (game.isLegalMove(col)) {
      if (game.stats.iAmRed && game.stats.future[0] == "r") {
        event.target.style.cursor = "pointer";
      }
      else if (!game.stats.iAmRed && game.stats.future[0] == "b") {
        event.target.style.cursor = "pointer";
      } 
    }
  });

  // When a valid move is made, update game and send game.
  boardDiv.addEventListener("click", function(event) {
    var col = getCol(event);
    if (game.isLegalMove(col)) {
      if (game.stats.iAmRed && game.stats.future[0] == "r") {
        game.move(col);
        show(game.stats, showNumbers, handle);
        socket.emit("my", "game stats", game.stats, id);
      }
      else if (!game.stats.iAmRed && game.stats.future[0] == "b") {
        game.move(col);
        show(game.stats, showNumbers, handle);
        socket.emit("my", "game stats", game.stats, id);
      }
    }
  });

  controls.addEventListener("click", function(event) {
    if (event.target.id == "number-toggle") {
      showNumbers = !showNumbers;
      show(game.stats, showNumbers, handle);
    }
    else if (event.target.id == "resign" && game.stats.history != null && game.stats.winner == null) {
      game.resign(game.stats.iAmRed);
      show(game.stats, showNumbers, handle);
      socket.emit("my", "game stats", game.stats, id);
    }
  });

  rematchBtn.addEventListener("change", function() {
    game.stats.iWantMore = !game.stats.iWantMore;
    if (game.stats.iWantMore && game.stats.theyWantMore) {
      game.clear();
    }
    show(game.stats, showNumbers, handle);
    socket.emit("my", "game stats", game.stats, id);
  });

  // Handle socket stuff.
  socket.on("their", function(type, thing) {

    // The "message" type is for emits that carry a thing that is one of the following strings.
    if (type == "message") {

      // Hiding the start panel and the play panel.
      if (thing == "play animation") {
        playPanel.style.display = "flex";
        setTimeout(function() {
          playPanel.style.display = "none";
        }, 2000);
      }

      // Updating the other player with all info.
      if (thing == "sync") {
        socket.emit("my", "game stats", game.stats, id);
      }
    }

    // Other types carry a custom thing.
    else if (type == "game stats") {
      game.assign(thing);
      show(game.stats, showNumbers, handle);
    }
  });

  // Disconnect before unload.
  window.addEventListener("beforeunload", function() {
    socket.emit("leave room", id);
  });
})();
