// Here is a "class" representing a stats.
const gameModule = function() {

  // The stats object is the only thing that is emitted by sockets.
  stats = {
    history: null,
    openRows: null,
    firstTurn: null,
    currentTurn: null,
    future: null,
    winner: null,
    redStart: null,
    bluStart: null,
    redTime: null,
    bluTime: null,
  };

  // PRIVATE FUNCTIONS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Flips the timer.
  function flip() {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (stats.redStart > stats.bluStart) {
      stats.redTime -= currentTime - stats.redStart;
      stats.bluStart = currentTime;
    }
    // Blu is completing its move.
    else if (stats.redStart < stats.bluStart) {
      stats.bluTime -= currentTime - stats.bluStart;
      stats.redStart = currentTime;
    }
    // Hopefully stats.redStart and stats.bluStart are never equal...
    console.log("flip");
  }

  // Stops the timer.
  function stop() {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (stats.redStart > stats.bluStart) {
      stats.redTime -= currentTime - stats.redStart;
    }
    // Blu is completing its move.
    else if (stats.redStart < stats.bluStart) {
      stats.bluTime -= currentTime - stats.bluStart;
    }
    // Hopefully stats.redStart and stats.bluStart are never equal...
    console.log("stop");
  }

  // Starts at the most recent move, then counts matching colors in the direction specified by up and right.
  function count(up, right) {
    var color = stats.history.slice(-3, -2);
    var col = parseInt(stats.history.slice(-2, -1));
    var row = parseInt(stats.history.slice(-1));
    var count = 0;
    var move = color + col + row;
    while (stats.history.includes(move)) {
      col += right;
      row += up;
      move = color + col + row;
      count++;
    }
    return count;
  }

  // Returns true if the most recent move is part of a four-in-a-row.
  function isWinningMove() {
    var hori = count(0, -1) + count(0, 1) - 1;
    var vert = count(-1, 0) + count(1, 0) - 1;
    var diag = count(1, -1) + count(-1, 1) - 1;
    var antd = count(1, 1) + count(-1, -1) - 1;
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

  // Updates game stats with given new stats.
  function assign(newStats) {
    Object.assign(stats, newStats);
  }
  
  // Starts a game with the given time control.
  function start(time) {
    stats.history = "";
    stats.openRows = [0, 0, 0, 0, 0, 0, 0];
    stats.firstTurn = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
    // stats.firstTurn = 0;
    stats.currentTurn = stats.firstTurn;
    stats.future = "";
    stats.isOver = false;
    for (let i = 0; i < 8; i++) {
      // XORing with thueMorse(stats.firstTurn) ensures that the first player is always red.
      if (thueMorse(stats.firstTurn) ^ thueMorse(stats.currentTurn + i) == 0) {
        stats.future += "r";
      }
      else {
        stats.future += "b";
      }
    }
    stats.redStart = new Date().getTime(); // The start time (in ms) of each color's most recent move/pair of moves.
    stats.bluStart = null;
    if (time == 1) {          // The time elapsed (in ms) for each color, NOT INCLUDING THE ACTIVE TIMING INTERVAL.
      stats.redTime = 60000;
      stats.bluTime = 60000;
    }
    else if (time == 3) {
      stats.redTime = 180000;
      stats.bluTime = 180000;
    }
    else if (time == 10) {
      stats.redTime = 600000;
      stats.bluTime = 600000;
    }
    else {
      stats.redTime = 0;
      stats.bluTime = 0;
    }
  }

  // Records a move in the given column, flipping/stopping the timer if necessary.
  function move(col) {
    var row = stats.openRows[col];
    stats.history += stats.future[0] + col + row;
    stats.openRows[col] += 1;
    stats.currentTurn += 1;
    stats.future = "";
    for (let i = 0; i < 8; i++) {
      if (thueMorse(stats.firstTurn) ^ thueMorse(stats.currentTurn + i) == 0) stats.future += "r";
      else stats.future += "b";
    }
    if (isWinningMove()) {
      stats.winner = stats.history.slice(-3, -2);
      stop();
    }
    else if (stats.history.slice(-3, -2) != stats.future.slice(0, 1)) {
      flip();
    }
  }

  return {
    stats: stats,
    assign: assign,
    start: start,
    move: move,
  };
};
