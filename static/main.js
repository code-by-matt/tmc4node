// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var startPanel = document.getElementById("start");
  var playPanel = document.getElementById("play");
  var rematchBtn = document.getElementById("rematch");
  var boardDiv = document.getElementById("board-div");
  var controls = document.getElementById("controls");

  // Create a game and other pertinent variables.
  var game = gameModule();
  var handle = {val: 0};
  var theyAreReady = false;
  var showNumbers = false;
  show(game.stats, showNumbers, handle);
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  socket.emit("my", "message", "sync", id);

  // Handle events that happen in the start panel.
  startPanel.addEventListener("change", function(event) {

    // These socket emits keep the other player up to date on your actions.
    if (event.target.className == "name") {
      socket.emit("my", "sender name", event.target.value, id);
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

    // If everything's set up, start a game.
    if (startPanel.querySelectorAll(".name")[0].value != "" && startPanel.querySelectorAll(".name")[1].textContent != "" && startPanel.querySelector("#ready").checked && theyAreReady) {

      // Transfer names from start panel to the controls.
      controls.querySelectorAll(".name")[0].textContent = startPanel.querySelectorAll(".name")[0].value;
      controls.querySelectorAll(".name")[1].textContent = startPanel.querySelectorAll(".name")[1].textContent;
      socket.emit("my", "message", "transfer names", id);

      // Create the game object with appropriate time control.
      if (startPanel.querySelector("#one-min").checked) {
        game.start(1);
      }
      else if (startPanel.querySelector("#thr-min").checked) {
        game.start(3);
      }
      else if (startPanel.querySelector("#ten-min").checked) {
        game.start(10);
      }
      else {
        game.start(-1);
      }

      // Display the game object.
      show(game.stats, showNumbers, handle);
      socket.emit("my", "game stats", game.stats, id);

      // Hide start panel, show play panel, wait two seconds, then hide play panel.
      playPanel.style.display = "flex";
      setTimeout(function() {
        playPanel.style.display = "none";
      }, 2000);
      socket.emit("my", "message", "play animation", id);
    }
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
    if (game.stats.history != null && game.stats.openRows[col] < 6 && game.stats.winner == null) {
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
    if (game.stats.history != null && game.stats.openRows[col] < 6 && game.stats.winner == null) {
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

  rematchBtn.addEventListener("click", function() {
    startPanel.querySelector("#ready").click();
    game.clear();
    show(game.stats, showNumbers, handle);
    socket.emit("my", "message", "rematch", id);
  });

  // Keep an eye out for timeouts.
  var wao = setInterval(function() {
    if (controls.querySelector("#my-time").textContent == "00:00" || controls.querySelector("#their-time").textContent == "00:00") {
      clearInterval(wao);
      game.timeout();
      show(game.stats, showNumbers, handle);
      socket.emit("my", "game stats", game.stats, id);
    }
  }, 100);

  // Handle socket stuff.
  socket.on("their", function(type, thing) {

    // The "message" type is for emits that carry a thing that is one of the following strings.
    if (type == "message") {

      // Start panel buttons.
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

      // Hiding the start panel and the play panel.
      else if (thing == "play animation") {
        playPanel.style.display = "flex";
        setTimeout(function() {
          playPanel.style.display = "none";
        }, 2000);
      }

      // Moving names from the start panel into the controls.
      else if (thing == "transfer names") {
        controls.querySelectorAll(".name")[0].textContent = startPanel.querySelectorAll(".name")[0].value;
        controls.querySelectorAll(".name")[1].textContent = startPanel.querySelectorAll(".name")[1].textContent;
      }

      // Updating the other player with all info.
      else if (thing == "sync") {

        // Give names.
        socket.emit("my", "sender name", startPanel.querySelectorAll(".name")[0].value, id);
        socket.emit("my", "receiver name", startPanel.querySelectorAll(".name")[1].textContent, id);

        // Give time control, if one has been clicked.
        if (startPanel.querySelector("#one-min").checked) {
          socket.emit("my", "message", "one minute", id);
        }
        else if (startPanel.querySelector("#thr-min").checked) {
          socket.emit("my", "message", "three minutes", id);
        }
        else if (startPanel.querySelector("#ten-min").checked) {
          socket.emit("my", "message", "ten minutes", id);
        }
        else if (startPanel.querySelector("#inf-min").checked) {
          socket.emit("my", "message", "infinity minutes", id);
        }

        // Give readiness, if ready.
        if (startPanel.querySelector("#ready").checked) {
          socket.emit("my", "message", "ready", id);
        }

        // If the game has started, give all the game stuff.
        if (game.stats.history != null) {
          socket.emit("my", "message", "transfer names", id);
          socket.emit("my", "game stats", game.stats, id);
        }
      }

      else if (thing == "rematch") {
        startPanel.querySelector("#ready").click();
        game.clear();
        show(game.stats, showNumbers, handle);
      }
    }

    // Other types carry a custom thing.
    else if (type == "sender name") {
      startPanel.querySelectorAll(".name")[1].textContent = thing;
    }
    else if (type == "receiver name") {
      startPanel.querySelectorAll(".name")[0].value = thing;
    }
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
