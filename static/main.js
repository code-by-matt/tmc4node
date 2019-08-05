// We use an IIFE to protect our script from evil outside forces.
var iAmRed;
(function() {

  // Grab lots of document elements.
  var startPanel = document.getElementById("start-panel");
  var playPanel = document.getElementById("play-panel");
  var endPanel = document.getElementById("end-panel");
  var boardDiv = document.getElementById("board-div");
  var controls = document.getElementById("controls");

  // Load some modules.
  var l = logic(game);
  var d = display(game);
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  socket.emit("my", "message", "sync", id);
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

      // Transfer names from start panel to the controls.
      controls.querySelector(".my-name").textContent = startPanel.querySelector(".my-name").value;
      controls.querySelector(".their-name").textContent = startPanel.querySelector(".their-name").textContent;
      socket.emit("my", "message", "transfer names", id);

      // Crate the game object with appropriate time control.
      if (startPanel.querySelector("#one-min").checked) {
        l.init(1);
      }
      else if (startPanel.querySelector("#thr-min").checked) {
        l.init(3);
      }
      else if (startPanel.querySelector("#ten-min").checked) {
        l.init(10);
      }
      else {
        l.init(-1);
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
      d.drawBoard(writeNumbers);
      d.drawFuture();
      d.displayTimes();
      socket.emit("my", "game", game, id);

      // Hide start panel, revealing play panel, wait two seconds, then hide play panel.
      startPanel.style.display = "none";
      setTimeout(function() {
        playPanel.style.display = "none";
      }, 2000);
      socket.emit("my", "message", "hide-hide animation", id);
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

  // Change cursor style when appropriate.
  boardDiv.addEventListener("mousemove",  function(event) {
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
  });

  // When a valid move is made, update game and send game.
  boardDiv.addEventListener("click", function(event) {
    var col = d.getCol(event);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (iAmRed && game.future[0] == "r") {
        l.update(col);
        d.drawBoard(writeNumbers);
        d.drawFuture();
        if (game.isOver) {
          clearInterval(handle);
          d.displayStoppedTimes();
          endPanel.style.display = "flex";
        }
        else {
          d.displayTimes();
        }
        socket.emit("my", "game", game, id);
      }
      else if (!iAmRed && game.future[0] == "b") {
        l.update(col);
        d.drawBoard(writeNumbers);
        d.drawFuture();
        if (game.isOver) {
          clearInterval(handle);
          d.displayStoppedTimes();
          endPanel.style.display = "flex";
        }
        else {
          d.displayTimes();
        }
        socket.emit("my", "game", game, id);
      }
    }
  });

  controls.addEventListener("click", function(event) {
    if (event.target.id == "number-toggle") {
      writeNumbers = !writeNumbers;
      d.drawBoard(writeNumbers);
    }
  });

  var wao = setInterval(function() {
    if (controls.querySelector("#my-time").textContent == "00:00" || controls.querySelector("#their-time").textContent == "00:00") {
      clearInterval(handle);
      endPanel.style.display = "flex";
      clearInterval(wao);
    }
  }, 10);

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
      else if (thing == "hide-hide animation") {
        startPanel.style.display = "none";
        setTimeout(function() {
          playPanel.style.display = "none";
        }, 2000);
      }
      else if (thing == "hide-hide instant") {
        startPanel.style.display = "none";
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
      else if (thing == "sync") {
        socket.emit("my", "sender name", startPanel.querySelector(".my-name").value, id);
        socket.emit("my", "receiver name", startPanel.querySelector(".their-name").textContent, id);
        if (game.redStart != undefined) {
          socket.emit("my", "message", "hide-hide instant", id);
          socket.emit("my", "message", "transfer names", id);
          if (iAmRed) {
            socket.emit("my", "message", "sender is red", id);
          }
          else {
            socket.emit("my", "message", "sender is blue", id);
          }
          socket.emit("my", "game", game, id);
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
    else if (type == "game") {
      Object.assign(game, thing);
      d.drawBoard(writeNumbers);
      d.drawFuture();
      if (game.isOver) {
        clearInterval(handle);
        d.displayStoppedTimes();
        endPanel.style.display = "flex";
      }
      else {
        d.displayTimes();
      }
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
