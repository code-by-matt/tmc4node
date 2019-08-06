// Here are the functions that deal with displaying information.
const show = function(stats, numbers) {

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

  // HELPER FUNCTIONS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Converts a time in ms into a human-readable string.
  function convert(ms) {
    var min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    var sec = Math.floor((ms % (1000 * 60)) / 1000);
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    return min + ':' + sec;
  }

  // Returns human-readable strings of red's and blu's play time at the instant this function is called.
  function times(redStart, redTime, bluStart, bluTime) {
    var redString, bluString;
    var currentTime = new Date().getTime();
    // It is red's very first turn.
    if (bluStart == null) {
      redString = convert(redTime - currentTime + redStart);
      bluString = convert(bluTime); 
    }
    // Red is in the middle of making a move.
    else if (redStart > bluStart) {
      redString = convert(redTime - currentTime + redStart);
      bluString = convert(bluTime);
    }
    // Blu is in the middle of making a move.
    else {
      redString = convert(redTime);
      bluString = convert(bluTime - currentTime + bluStart);
    }
    return [redString, bluString];
  }

  // Writes the player times every tenth of a second.
  function showRunningTimes(redStart, redTime, bluStart, bluTime) {
    if (handle != 0) {
      clearInterval(handle);
    }
    handle = setInterval(function() {
      var yeet = times(redStart, redTime, bluStart, bluTime);
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
  function showStoppedTimes(redTime, bluTime) {
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

  function showBoard(history, numbers) {
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
      if (numbers) {
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

  // Shows the board, future, and times of the given game stats, with or without move numbers.
  if (stats == null) {
    showBoard("", false);
  }
  else {
    showBoard(stats.history, numbers);
    showFuture(stats.future);
    if (stats.winner == null) {
      showRunningTimes(stats.redStart, stats.redTime, stats.bluStart, stats.bluTime);
    }
    else {
      showStoppedTimes(stats.redTime, stats.bluTime);
    }
  }
};
