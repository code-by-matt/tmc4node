// Here are the functions that deal with displaying information.
var display = function() {

  // VARIABLES ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Handle should ultimately go here? Nah.
  
  // Future and board are drawn in these (invisbile) canvas elements...
  var futureCan = document.getElementById("future-canvas");
  var boardCan = document.getElementById("board-canvas");

  // ...then they are displayed in these image elements.
  var futureImg = document.getElementById("future-img");
  var boardImg = document.getElementById("board-img");

  // These divs are where the players' colors are displayed.
  var myColor = document.getElementById("my-color");
  var theirColor = document.getElementById("their-color");

  // These divs are where the players' names are displayed.
  var myNameDiv = document.getElementById("my-name");
  var theirNameDiv = document.getElementById("their-name");

  // This is where you type in your own name. It gets swapped with a (non-editable) div when you press enter.
  var myNameInput = document.getElementById("my-name-input");

  // Player times displayed here.
  var redDiv = document.getElementById("red-div");
  var bluDiv = document.getElementById("blu-div");
  
  // This is a div that tells you some useful info.
  var marquee = document.getElementById("marquee");

  // PRIVATE FUNCTIONS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Converts a time in ms into a human-readable string.
  function convert(ms) {
    var min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    var sec = Math.floor((ms % (1000 * 60)) / 1000);
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    return min + ':' + sec;
  }

  // Returns human-readable strings of red's and blu's play time at the instant this function is called.
  function times(game) {
    var redString, bluString;
    var currentTime = new Date().getTime();
    // It is red's very first turn.
    if (game.bluStart == null) {
      redString = convert(game.redTime + currentTime - game.redStart);
      bluString = "00:00";
    }
    // Red is in the middle of making a move.
    else if (game.redStart > game.bluStart) {
      redString = convert(game.redTime + currentTime - game.redStart);
      bluString = convert(game.bluTime);
    }
    // Blu is in the middle of making a move.
    else {
      redString = convert(game.redTime);
      bluString = convert(game.bluTime + currentTime - game.bluStart);
    }
    return [redString, bluString];
  }

  // Writes the player times every tenth of a second,
  function displayTimes(game) {
    if (handle != 0) {
      clearInterval(handle);
    }
    handle = setInterval(function() {
      var yeet = times(game);
      redDiv.innerHTML = yeet[0];
      bluDiv.innerHTML = yeet[1];
      console.log("running");
    }, 100);
  }

  // PUBLIC FUNCTIONS –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  function stop(game, handle) {
    clearInterval(handle);
    handle = 0;
    game.redStart = Number.NEGATIVE_INFINITY;
    game.bluStart = Number.NEGATIVE_INFINITY;
    game.redTime = 0;
    game.bluTime = 0;
    redDiv.innerHTML = "00:00";
    bluDiv.innerHTML = "00:00";
  }

  // Calculates the column in which a player clicked (0 thru 6).
  function getCol(event) {
    return Math.floor((7 * (event.pageX - boardImg.offsetLeft))/boardImg.offsetWidth);
  }

  // Writes your own name.
  function writeMe(name) {
    if (name != "") {
      if (name == theirNameDiv.textContent) {
        myNameDiv.textContent = name + " 2";
      }
      else {
        myNameDiv.textContent = name;
      }
      myNameDiv.style.display = "block";
      myNameInput.style.display = "none";
    }
  }

  // Writes your opponent's name.
  function writeThem(name) {
    theirNameDiv.textContent = name;
  }

  // Assigns colors to the players.
  function drawColors(game) {
    if (game.red == myNameDiv.textContent && game.blu == theirNameDiv.textContent) {
      myColor.style.backgroundColor = "#DC3545";
      theirColor.style.backgroundColor = "#007BFF";
    }
    else if (game.blu == myNameDiv.textContent && game.red == theirNameDiv.textContent) {
      myColor.style.backgroundColor = "#007BFF";
      theirColor.style.backgroundColor = "#DC3545";
    }
  }

  function drawFuture(game) {
    var ctx = futureCan.getContext("2d");
    // // Wipe out the previous future.
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, 1600, 200);
    // Draw the future.
    for (let i = 0; i < 8; i++) {
      if (game.future[i] == "r") {
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

  function drawBoard(game) {
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
    for (let i = 0; i < game.history.length; i += 3) {
      let color = game.history.charAt(i);
      let col = game.history.charAt(i + 1);
      let row = game.history.charAt(i + 2);
      let number = (i / 3) + 1;
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
      ctx.fillText(number, (200 * col) + 100, (200 * (5 - row)) + 100);
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

  function tryDraw(game) {
    if (game.red != undefined && game.blu != undefined) drawColors(game);
    if (game.future != undefined) drawFuture(game);
    if (game.history != undefined) drawBoard(game);
    if (game.redStart != undefined) displayTimes(game);
  }

  // Public function that displays a "3-2-1-Play!"" countdown in the marquee.
  function countdown() {
    marquee.textContent = "3... ";
    setTimeout(function() {
      marquee.textContent += "2... ";
    }, 1000);
    setTimeout(function() {
      marquee.textContent += "1...";
    }, 2000);
    setTimeout(function() {
      marquee.textContent = "Play!";
    }, 3000);
  }

  return {
    getCol: getCol,
    writeMe: writeMe,
    writeThem: writeThem,
    tryDraw: tryDraw,
    countdown: countdown,
  };
};
