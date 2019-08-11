// We use an IIFE to protect our script from evil outside forces.
(function() {

  // Grab lots of document elements.
  var startPanel = document.getElementById("start-panel");
  var playPanel = document.getElementById("play-panel");
  var rematchBtn = document.getElementById("rematch");
  var boardDiv = document.getElementById("board-div");
  var controls = document.getElementById("controls");

  // Create a game instance.
  var game = gameModule();
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  show(null, null, null, null);
  var socket = io();
  socket.emit("join room", id);
  socket.emit("my", "message", "sync", id);

  var handle = {val: 0};
  var theyAreReady = false;
  var showNumbers = false;
  var iAmRed;

  // Handle events that happen in the start panel.
  startPanel.addEventListener("change", function(event) {

    // These socket emits keep the other player up to date on your actions.
    if (event.target.className == "my-name") {
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
    if (startPanel.querySelector(".my-name").value != "" && startPanel.querySelector(".their-name").textContent != "" && startPanel.querySelector("#ready").checked && theyAreReady) {

      // Transfer names from start panel to the controls.
      controls.querySelector(".my-name").textContent = startPanel.querySelector(".my-name").value;
      controls.querySelector(".their-name").textContent = startPanel.querySelector(".their-name").textContent;
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

      // Randomly assign colors to each player.
      if (Math.random() > 0.5) {
        iAmRed = true;
        controls.querySelector("#my-color").style.backgroundColor = "#DC3545";
        controls.querySelector("#their-color").style.backgroundColor = "#007BFF";
        socket.emit("my", "message", "sender is red", id);
      }
      else {
        iAmRed = false;
        controls.querySelector("#my-color").style.backgroundColor = "#007BFF";
        controls.querySelector("#their-color").style.backgroundColor = "#DC3545";
        socket.emit("my", "message", "sender is blue", id);
      }

      // Display the game object.
      show(game.stats, showNumbers, iAmRed, handle);
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
      if (iAmRed && game.stats.future[0] == "r") {
        event.target.style.cursor = "pointer";
      }
      else if (!iAmRed && game.stats.future[0] == "b") {
        event.target.style.cursor = "pointer";
      } 
    }
  });

  // When a valid move is made, update game and send game.
  boardDiv.addEventListener("click", function(event) {
    var col = getCol(event);
    if (game.stats.history != null && game.stats.openRows[col] < 6 && game.stats.winner == null) {
      if (iAmRed && game.stats.future[0] == "r") {
        game.move(col);
        show(game.stats, showNumbers, iAmRed, handle);
        socket.emit("my", "game stats", game.stats, id);
      }
      else if (!iAmRed && game.stats.future[0] == "b") {
        game.move(col);
        show(game.stats, showNumbers, iAmRed, handle);
        socket.emit("my", "game stats", game.stats, id);
      }
    }
  });

  controls.addEventListener("click", function(event) {
    if (event.target.id == "number-toggle") {
      showNumbers = !showNumbers;
      show(game.stats, showNumbers, iAmRed, handle);
    }
    else if (event.target.id == "resign" && game.stats.history != null && game.stats.winner == null) {
      game.resign(iAmRed);
      show(game.stats, showNumbers, iAmRed, handle);
      socket.emit("my", "game stats", game.stats, id);
    }
  });

  rematchBtn.addEventListener("click", function() {
    console.log("bruh");
  });

  // Keep an eye out for timeouts.
  var wao = setInterval(function() {
    if (controls.querySelector("#my-time").textContent == "00:00" || controls.querySelector("#their-time").textContent == "00:00") {
      clearInterval(wao);
      game.timeout();
      show(game.stats, showNumbers, iAmRed, handle);
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

      // Assigning colors.
      else if (thing == "sender is red") {
        iAmRed = false;
        controls.querySelector("#my-color").style.backgroundColor = "#007BFF";
        controls.querySelector("#their-color").style.backgroundColor = "#DC3545";
      }
      else if (thing == "sender is blue") {
        iAmRed = true;
        controls.querySelector("#my-color").style.backgroundColor = "#DC3545";
        controls.querySelector("#their-color").style.backgroundColor = "#007BFF";
      }

      // Moving names from the start panel into the controls.
      else if (thing == "transfer names") {
        controls.querySelector(".my-name").textContent = startPanel.querySelector(".my-name").value;
        controls.querySelector(".their-name").textContent = startPanel.querySelector(".their-name").textContent;
      }

      // Updating the other player with all info.
      else if (thing == "sync") {

        // Give names.
        socket.emit("my", "sender name", startPanel.querySelector(".my-name").value, id);
        socket.emit("my", "receiver name", startPanel.querySelector(".their-name").textContent, id);

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
          if (iAmRed) {
            socket.emit("my", "message", "sender is red", id);
          }
          else {
            socket.emit("my", "message", "sender is blue", id);
          }
          socket.emit("my", "game stats", game.stats, id);
        }
      }
    }

    // Other types carry a custom thing.
    else if (type == "sender name") {
      startPanel.querySelector(".their-name").textContent = thing;
    }
    else if (type == "receiver name") {
      startPanel.querySelector(".my-name").value = thing;
    }
    else if (type == "game stats") {
      game.assign(thing);
      show(game.stats, showNumbers, iAmRed, handle);
    }
  });

  // When reset is clicked, reset game and send reset request.
  // readyBtn.addEventListener("change", function() {
    // if (readyBtn.checked && theyAreReady) {
    //   socket.emit("countdown", id);
    //   d.countdown();
    //   setTimeout(function() {
    //     l.init(myNameDiv.textContent, theirNameDiv.textContent);
    //     socket.emit("my game", id, game);
    //     d.tryDraw();
    //   }, 3000);
    // }
    // if (game.stats.winner != null) {
    //   socket.emit("countdown", id);
    //   d.countdown();
    //   setTimeout(function() {
    //     l.init(myNameDiv.textContent, theirNameDiv.textContent);
    //     socket.emit("my game", id, game);
    //     d.tryDraw();
    //   }, 3000);
    // }
  // });

  // Disconnect before unload.
  window.addEventListener("beforeunload", function() {
    socket.emit("leave room", id);
  });
})();
