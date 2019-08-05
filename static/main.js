// We use an IIFE to protect our script from evil outside forces.
var iAmRed;
(function() {

  // Grab lots of document elements.
  var startPanel = document.getElementById("start-panel");
  var playPanel = document.getElementById("play-panel");
  var controls = document.getElementById("controls");

  // Load some modules.
  var l = logic(game);
  var d = display(game);
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  // socket.emit("sync pls", id);
  d.drawBoard(writeNumbers);

  var theyAreReady = false;
  var writeNumbers = true;

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

      // Hide start panel, revealing play panel.
      startPanel.style.display = "none";
      socket.emit("my", "message", "hide start panel", id);

      // Transfer names from start panel to the controls.
      controls.querySelector(".my-name").textContent = startPanel.querySelector(".my-name").value;
      controls.querySelector(".their-name").textContent = startPanel.querySelector(".their-name").textContent;
      socket.emit("my", "message", "transfer names", id);

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

      // Create and display a game object.
      l.init();
      d.drawBoard(writeNumbers);
      d.drawFuture();
      d.displayTimes();
      socket.emit("my", "game", game, id);

      // Hide play panel after one second.
      setTimeout(function() {
        playPanel.style.display = "none";
        socket.emit("my", "message", "hide play panel", id);
      }, 1000);
    }
  });

  // Change cursor style when appropriate.
  window.addEventListener("mousemove",  function(event) {
    if (event.target.id == "board-img") {
      event.target.style.cursor = "default";
      var col = d.getCol(event);
      if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
        if (iAmRed && game.future[0] == "r") {
          event.target.style.cursor = "pointer";
        }
        else if (!iAmRed && game.future[0] == "b") {
          event.target.style.cursor = "pointer";
        } 
      }
    }
  });

  // When a valid move is made, update game and send game.
  window.addEventListener("click", function(event) {
    if (event.target.id == "board-img") {
      var col = d.getCol(event);
      if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
        if (iAmRed && game.future[0] == "r") {
          l.update(col);
          d.drawBoard(writeNumbers);
          d.drawFuture();
          d.displayTimes();
          socket.emit("my", "game", game, id);
          if (game.isOver) {
            this.document.getElementById("end-panel").style.display = "flex";
            socket.emit("my", "message", "show end panel", id);
          }
        }
        else if (!iAmRed && game.future[0] == "b") {
          l.update(col);
          d.drawBoard(writeNumbers);
          d.drawFuture();
          d.displayTimes();
          socket.emit("my", "game", game, id);
        }
      }
    }
  });

  controls.addEventListener("click", function(event) {
    if (event.target.id == "number-toggle") {
      writeNumbers = !writeNumbers;
      d.drawBoard(writeNumbers);
    }
  });

  // Handle socket stuff.
  socket.on("their", function(type, thing) {

    // The "message" type is for emits that carry a thing that is one of the following strings.
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
      else if (thing == "hide start panel") {
        startPanel.style.display = "none";
      }
      else if (thing == "hide play panel") {
        playPanel.style.display = "none";
      }
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
      else if (thing == "transfer names") {
        controls.querySelector(".my-name").textContent = startPanel.querySelector(".my-name").value;
        controls.querySelector(".their-name").textContent = startPanel.querySelector(".their-name").textContent;
      }
      else if (thing == "show end panel") {
        document.getElementById("end-panel").style.display = "flex";
      }
    }

    // Other types carry a custom thing.
    else if (type == "sender name") {
      startPanel.querySelector(".their-name").textContent = thing;
    }
    else if (type == "receiver name") {
      startPanel.querySelector(".my-name").value = thing;
    }
    else if (type == "game") {
      Object.assign(game, thing);
      d.drawBoard(writeNumbers);
      d.drawFuture();
      d.displayTimes();
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
    // if (game.isOver) {
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

  // This handler is triggered when you receive a sync from your opponent.
  // socket.on("here ya go", function(senderGame, senderName, receiverName) {
  //   d.writeThem(senderName);
  //   d.writeMe(receiverName);
  //   // Object.assign(game, senderGame);
  //   // d.tryDraw();
  // });
})();
