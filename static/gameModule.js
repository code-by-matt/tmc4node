// Here is a "class" representing a stats.
const gameModule = function() {

  // The stats object is the only thing that is emitted by sockets.
  stats = {

    // We call these the non-timing properties.
    future: null,      // A string of the colors of the next eight moves.
    history: null,     // A string representing the squares on the board, in the order they were played.
    openRows: null,    // An integer array where element i is the lowest open row in column i of the board.
    firstTurn: null,   // An integer that is the position in the Thue-Morse sequence where the game started.
    currentTurn: null, // An integer that is the position in the Thue-Morse sequence where the game is now.

    // We call these the timing properties.
    moveStart: null,   // The moment in time (in ms) at which the current move started, whether it be red or blu.
    redTime: null,     // The amount of time (in ms) that red has spent playing, excluding the current move.
    bluTime: null,     // The amount of time (in ms) that blu has spent playing, excluding the current move.

    // We call these the winning properties.
    winner: null,      // The winner of the game. Either "Red", "Blue", or null.
    winBy: null,       // How the game was won. Either "connection", "timeout", "resignation", or null.
  };

  // PRIVATE FUNCTIONS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

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

    // Initialize the timing properties.
    stats.moveStart = new Date().getTime();
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

    // Initialize the non-timing properties.
    stats.history = "";
    stats.openRows = [0, 0, 0, 0, 0, 0, 0];
    stats.firstTurn = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
    // stats.firstTurn = 0;
    stats.currentTurn = stats.firstTurn;
    stats.future = "";
    for (let i = 0; i < 8; i++) {
      // XORing with thueMorse(stats.firstTurn) ensures that the first player is always red.
      if (thueMorse(stats.firstTurn) ^ thueMorse(stats.currentTurn + i) == 0) {
        stats.future += "r";
      }
      else {
        stats.future += "b";
      }
    }
  }

  // Records a move in the given column.
  function move(col) {

    // Update the timing properties.
    var moveEnd = new Date().getTime();
    if (stats.future[0] == "r") {
      stats.redTime -= moveEnd - stats.moveStart;
    }
    else {
      stats.bluTime -= moveEnd - stats.moveStart;
    }
    stats.moveStart = moveEnd;

    // Update the non-timing properties.
    var row = stats.openRows[col];
    stats.history += stats.future[0] + col + row;
    stats.openRows[col] += 1;
    stats.currentTurn += 1;
    stats.future = "";
    for (let i = 0; i < 8; i++) {
      if (thueMorse(stats.firstTurn) ^ thueMorse(stats.currentTurn + i) == 0) stats.future += "r";
      else stats.future += "b";
    }

    // Update the winning properties.
    if (isWinningMove()) {
      stats.winBy = "connection";
      if (stats.history.slice(-3, -2) == "r") {
        stats.winner = "Red";
      }
      else {
        stats.winner = "Blue";
      }
    }
  }

  // Stops the game on a timeout.
  function timeout(winner) {

    // Update the timing properties.
    var moveEnd = new Date().getTime();
    if (stats.future[0] == "r") {
      stats.redTime -= moveEnd - stats.moveStart;
    }
    else {
      stats.bluTime -= moveEnd - stats.moveStart;
    }
    stats.moveStart = moveEnd;

    // Update the winning properties.
    stats.winner = winner;
    stats.winBy = "timeout";
  }

  return {
    stats: stats,
    assign: assign,
    start: start,
    move: move,
    timeout: timeout,
  };
};
