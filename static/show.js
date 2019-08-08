// Here are the functions that deal with displaying information.
const show = function(stats, showNumbers, iAmRed, handle) {

  // VARIABLES ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  
  // Future and board are drawn in these (invisbile) canvas elements...
  var futureCan = document.getElementById("future-canvas");
  var boardCan = document.getElementById("board-canvas");

  // ...then they are displayed in these image elements.
  var futureImg = document.getElementById("future-img");
  var boardImg = document.getElementById("board-img");

  // Player times displayed here.
  var myTimeDiv = document.getElementById("my-time");
  var theirTimeDiv = document.getElementById("their-time");

  // Game over message is displayed here.
  var endPanel = document.getElementById("end-panel");

  // HELPER FUNCTIONS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Converts a time in ms into a human-readable string. If ms is non-positive, returns "00:00".
  function convert(ms) {
    if (ms > 0) {
      var min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      var sec = Math.floor((ms % (1000 * 60)) / 1000);
      if (min < 10) min = "0" + min;
      if (sec < 10) sec = "0" + sec;
      return min + ':' + sec;
    }
    else {
      return "00:00";
    }
  }

  // Returns human-readable strings of red's and blu's play time at the instant this function is called.
  function times(moveStart, redTime, bluTime) {
    var currentTime = new Date().getTime();
    var redString, bluString;
    // The current move is red.
    if (stats.future[0] == "r") {
      redString = convert(redTime - currentTime + moveStart);
      bluString = convert(bluTime); 
    }
    // The current move is blue.
    else {
      redString = convert(redTime);
      bluString = convert(bluTime - currentTime + moveStart);
    }
    return [redString, bluString];
  }

  // Writes the player times every tenth of a second.
  function showRunningTimes(iAmRed, moveStart, redTime, bluTime) {
    if (handle.val != 0) {
      clearInterval(handle.val);
    }
    handle.val = setInterval(function() {
      var yeet = times(moveStart, redTime, bluTime);
      if (iAmRed) {
        myTimeDiv.textContent = yeet[0];
        theirTimeDiv.textContent = yeet[1];
      }
      else {
        myTimeDiv.textContent = yeet[1];
        theirTimeDiv.textContent = yeet[0];
      }
      console.log("running");
    }, 100);
  }

  // Writes the player times once, cuz they're not changing anymore.
  function showStoppedTimes(iAmRed, redTime, bluTime) {
    if (handle.val != 0) {
      clearInterval(handle.val);
    }
    if (iAmRed) {
      myTimeDiv.textContent = convert(redTime);
      theirTimeDiv.textContent = convert(bluTime);
    }
    else {
      myTimeDiv.textContent = convert(bluTime);
      theirTimeDiv.textContent = convert(redTime);
    }
  }

  function showFuture(future) {
    var ctx = futureCan.getContext("2d");
    // // Wipe out the previous future.
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, 1600, 200);
    // Draw the future.
    for (let i = 0; i < 8; i++) {
      if (future[i] == "r") {
        ctx.fillStyle = "#DC3545";
        ctx.fillRect((200 * i), 0, 200, 200);
      }
      else {
        ctx.fillStyle = "#007BFF";
        ctx.fillRect((200 * i), 0, 200, 200);
      }
    }
    // Put the canvas into the image.
    futureImg.src = futureCan.toDataURL();
  }

  function showBoard(history, showNumbers) {
    var ctx = boardCan.getContext("2d");
    // Wipe out the previous board.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 1400, 1200);
    // Draw gray squares.
    ctx.fillStyle = "#D8D8D8";
    for (let i = 0; i < 7; i += 1) {
      for (let j = 0; j < 6; j += 1) {
        if ((i + j) % 2 == 1) {
          ctx.fillRect(200*i, 200*j, 200, 200);
        }
      }
    }
    // Draw game history.
    ctx.font = "80px Arial";
    for (let i = 0; i < history.length; i += 3) {
      let color = history.charAt(i);
      let col = history.charAt(i + 1);
      let row = history.charAt(i + 2);
      if (color == "b") {
        ctx.fillStyle = "#007BFF";
        ctx.fillRect((200 * col), (200 * (5 - row)), 200, 200);
      }
      else if (color == "r") {
        ctx.fillStyle = "#DC3545";
        ctx.fillRect((200 * col), (200 * (5 - row)), 200, 200);
      }
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let number = (i / 3) + 1;
      if (showNumbers) {
        ctx.fillText(number, (200 * col) + 100, (200 * (5 - row)) + 100);
      }
    }
    // Draw lines.
    ctx.strokeStyle = "#D8D8D8";
    ctx.lineWidth = 3;
    for (let i = 1; i < 7; i += 1) {
        ctx.moveTo(200*i, 0);
        ctx.lineTo(200*i, 1200);
        ctx.stroke();
    }
    for (let i = 1; i < 6; i += 1) {
        ctx.moveTo(0, 200*i);
        ctx.lineTo(1400, 200*i);
        ctx.stroke();
    }
    // Put the canvas into the image.
    boardImg.src = boardCan.toDataURL();
  }

  // THE ACTUAL FUNCTION –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––  

  if (stats == null) {
    showBoard("", false);
  }
  else {
    showBoard(stats.history, showNumbers);
    showFuture(stats.future);
    if (stats.winner == null) {
      if (stats.moveStart != null) {
        showRunningTimes(iAmRed, stats.moveStart, stats.redTime, stats.bluTime);
      }
    }
    else {
      if (stats.moveStart != null) {
        showStoppedTimes(iAmRed, stats.redTime, stats.bluTime);
      }
      endPanel.textContent = stats.winner + " wins by " + stats.winBy + "!";
      endPanel.style.display = "flex";
    }
  }
};
