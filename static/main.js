// We use an IIFE to protect our script from evil outside forces.
var iAmRed;
(function() {

  // Grab lots of document elements.
  var boardImg = document.getElementById("board-img");
  var readyBtn = document.getElementById("ready");
  var myNamePanel = document.getElementById("my-name-panel");
  var theirNamePanel = document.getElementById("their-name-panel");
  var myName = document.getElementById("my-name");
  var theirName = document.getElementById("their-name");

  // These divs are where the players' colors are displayed.
  var myColor = document.getElementById("my-color");
  var theirColor = document.getElementById("their-color");

  // Load some modules.
  var l = logic(game);
  var d = display(game);
  
  // Establish a websocket connection, join the right room, ask to sync (if necessary).
  var socket = io();
  socket.emit("join room", id);
  // socket.emit("sync pls", id);
  d.drawBoard();
  
  var theyAreReady = false;

  // Handle events that happen in the start panel.
  document.getElementById("start-panel").addEventListener("change", function(event) {

    // These socket emits keep the other player up to date on your actions.
    if (event.target.id == "my-name-panel") {
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
    if (myNamePanel.value != "" && theirNamePanel.textContent != "" && readyBtn.checked && theyAreReady) {
      
      setTimeout(function() {
        // Hide start panel, revealing play panel.
        document.getElementById("start-panel").style.display = "none";
        socket.emit("my", "message", "hide start panel", id);
      }, 500);

      setTimeout(function() {
        // Hide play panel, revealing board.
        document.getElementById("play-panel").style.display = "none";
        socket.emit("my", "message", "hide play panel", id);
        // Transfer names from start panel to the row under the board.
        myName.textContent = myNamePanel.value;
        theirName.textContent = theirNamePanel.textContent;
        socket.emit("my", "message", "transfer names", id);
        // Randomly assign colors to each player.
        if (Math.random() > 0.5) {
          iAmRed = true;
          myColor.style.backgroundColor = "#DC3545";
          theirColor.style.backgroundColor = "#007BFF";
          socket.emit("my", "message", "sender is red", id);
        }
        else {
          iAmRed = false;
          myColor.style.backgroundColor = "#007BFF";
          theirColor.style.backgroundColor = "#DC3545";
          socket.emit("my", "message", "sender is blue", id);
        }
        // Create a game object, then display it.
        l.init();
        d.drawBoard();
        d.drawFuture();
        socket.emit("my", "game", game, id);
      }, 2000);
    }
  });

  // Handle socket stuff.
  socket.on("their", function(type, thing) {

    // The "message" type is for emits that don't need to send a custom thing.
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
        document.getElementById("start-panel").style.display = "none";
      }
      else if (thing == "hide play panel") {
        document.getElementById("play-panel").style.display = "none";
      }
      else if (thing == "sender is red") {
        iAmRed = false;
        myColor.style.backgroundColor = "#007BFF";
        theirColor.style.backgroundColor = "#DC3545";
      }
      else if (thing == "sender is blue") {
        iAmRed = true;
        myColor.style.backgroundColor = "#DC3545";
        theirColor.style.backgroundColor = "#007BFF";
      }
      else if (thing == "transfer names") {
        myName.textContent = myNamePanel.value;
        theirName.textContent = theirNamePanel.textContent;
      }
    }

    // Other types carry a custom thing.
    else if (type == "sender name") {
      document.getElementById("their-name-panel").textContent = thing;
    }
    else if (type == "receiver name") {
      document.getElementById("my-name-panel").textContent = thing;
    }
    else if (type == "game") {
      Object.assign(game, thing);
      d.drawBoard();
      d.drawFuture();
    }
  });

  // Change cursor style when appropriate.
  boardImg.addEventListener("mousemove",  function(event) {
    var col = d.getCol(event);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (iAmRed && game.future[0] == "r") {
        boardImg.style.cursor = "pointer";
      }
      else if (!iAmRed && game.future[0] == "b") {
        boardImg.style.cursor = "pointer";
      }
      else boardImg.style.cursor = "default";
    }
    else boardImg.style.cursor = "default";
  });

  // When a valid move is made, update game and send update game request.
  boardImg.addEventListener("click", function(event) {
    var col = d.getCol(event);
    console.log(myColor.style.backgroundColor);
    if (game.redStart != undefined && game.openRows[col] < 6 && !game.isOver) {
      if (iAmRed && game.future[0] == "r") {
        l.update(col);
        d.drawBoard();
        d.drawFuture();
        d.displayTimes();
        socket.emit("my", "game", game, id);
      }
      else if (!iAmRed && game.future[0] == "b") {
        l.update(col);
        d.drawBoard();
        d.drawFuture();
        d.displayTimes();
        socket.emit("my", "game", game, id);
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

  // This handler is triggered when you receive a sync from your opponent.
  // socket.on("here ya go", function(senderGame, senderName, receiverName) {
  //   d.writeThem(senderName);
  //   d.writeMe(receiverName);
  //   // Object.assign(game, senderGame);
  //   // d.tryDraw();
  // });
})();
