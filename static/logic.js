// Here are the functions that deal with assigning properties to the game object.
var logic = function() {

  // VARIABLES ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  
  // Player times displayed here.
  var redDiv = document.getElementById("red-div");
  var bluDiv = document.getElementById("blu-div");

  // Game status displayed here.
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

  // Flips the timer.
  function flip(game) {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (game.redStart > game.bluStart) {
      game.redTime += currentTime - game.redStart;
      game.bluStart = currentTime;
    }
    // Blu is completing its move.
    else if (game.redStart < game.bluStart) {
      game.bluTime += currentTime - game.bluStart;
      game.redStart = currentTime;
    }
    // Hopefully game.redStart and game.bluStart are never equal...
    console.log("flip");
  }

  // Starts at the most recent move, then counts matching colors in the direction specified by up and right.
  function count(game, up, right) {
    var color = game.history.slice(-3, -2);
    var col = parseInt(game.history.slice(-2, -1));
    var row = parseInt(game.history.slice(-1));
    var count = 0;
    var move = color + col + row;
    while (game.history.includes(move)) {
      col += right;
      row += up;
      move = color + col + row;
      count++;
    }
    return count;
  }

  // Returns whether or not someone has got four-in-a-row.
  function isWin(game) {
    var hori = count(game, 0, -1) + count(game, 0, 1) - 1;
    var vert = count(game, -1, 0) + count(game, 1, 0) - 1;
    var diag = count(game, 1, -1) + count(game, -1, 1) - 1;
    var antd = count(game, 1, 1) + count(game, -1, -1) - 1;
    // console.log("horizontal: " + hori);
    // console.log("vertical: " + vert);
    // console.log("diagonal: " + diag);
    // console.log("anti-diagonal: " + antd);
    if (hori >=4 | vert >= 4 | diag >= 4 | antd >= 4) {
      return true;
    }
    else return false;
  }

  // Calculates the nth Thue-Morse number.
  function thueMorse(n) {
    var count = 0;
    while (n != 0) {
      n = n & (n - 1);
      count++;
    }
    return count % 2;
  }

  // PUBLIC FUNCTIONS –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

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

  // Public function that updates the timer display every tenth of a second.
  function run(game) {
    game.handle = setInterval(function() {
      var yeet = times(game);
      redDiv.innerHTML = yeet[0];
      bluDiv.innerHTML = yeet[1];
      console.log("running");
    }, 100);
  }

  function stop(game) {
    clearInterval(game.handle);
    game.handle = 0;
    game.redStart = Number.NEGATIVE_INFINITY;
    game.bluStart = Number.NEGATIVE_INFINITY;
    game.redTime = 0;
    game.bluTime = 0;
    redDiv.innerHTML = "00:00";
    bluDiv.innerHTML = "00:00";
  }

  function isRunning(game) {
    return game.handle != 0;
  }

  // Initializes all game properties and immediately run its timer.
  function init(game, myName, theirName) {
    game.history = "";
    game.openRows = [0, 0, 0, 0, 0, 0, 0];
    game.firstTurn = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
    // game.firstTurn = 0;
    game.currentTurn = game.firstTurn;
    game.future = "";
    game.isOver = false;
    for (let i = 0; i < 8; i++) {
      // XORing with thueMorse(game.firstTurn) ensures that the first player is always red.
      if (thueMorse(game.firstTurn) ^ thueMorse(game.currentTurn + i) == 0) {
        game.future += "r";
      }
      else {
        game.future += "b";
      }
    }
    if (Math.random() > 0.5) {
      game.red = myName;
      game.blu = theirName;
    }
    else {
      game.red = theirName;
      game.blu = myName;
    }
    game.redStart = new Date().getTime(); // The start time (in ms) of each color's most recent move/pair of moves.
    game.bluStart = null;
    game.redTime = 0;         // The time elapsed (in ms) for each color, NOT INCLUDING THE ACTIVE TIMING INTERVAL.
    game.bluTime = 0;
    game.handle = 0; // This is a reference to the repeating code that runs the game. It is zero when the timer is stopped.
    run(game);
  }

  // Records a move in the given column, flipping the timer if necessary.
  function update(game, col) {
    var row = game.openRows[col];
    game.history += game.future[0] + col + row;
    game.openRows[col] += 1;
    game.currentTurn += 1;
    game.future = "";
    for (let i = 0; i < 8; i++) {
      if (thueMorse(game.firstTurn) ^ thueMorse(game.currentTurn + i) == 0) game.future += "r";
      else game.future += "b";
    }
    if (game.history.slice(-3, -2) != game.future.slice(0, 1)) {
      flip(game);
    }
    game.isOver = isWin(game);
  }

  return {
    countdown: countdown,
    init: init,
    run: run,
    isRunning: isRunning,
    update: update,
  };
};
