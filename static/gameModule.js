// Here is a "class" representing a stats.
const gameModule = function() {

  // The stats object is the only thing that is emitted by sockets.
  stats = {

    // We call these the non-timing properties.
    currentTurn: null, // An integer that is the position in the Thue-Morse sequence where the game is now.
    firstTurn: null,   // An integer that is the position in the Thue-Morse sequence where the game started.
    openRows: null,    // An integer array where element i is the lowest open row in column i of the board.
    history: null,     // A string representing the squares on the board, in the order they were played.
    future: null,      // A string of the colors of the next eight moves.
    iAmRed: null,      // A Boolean that tells me if I'm red. It's REVERSED when the opponent receives our game stats.

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
    newStats.iAmRed = !newStats.iAmRed;
    Object.assign(stats, newStats);
  }
  
  // Starts a game with the given time control.
  function start(time) {

    // Initialize the timing properties.
    stats.moveStart = new Date().getTime();
    if (time == 1) {
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
      stats.moveStart = null; // The nullness of moveStart is how we will determine if the game has time control.
    }

    // Initialize the non-timing properties.
    stats.currentTurn = Math.floor(Math.random() * 5000) * 2; // Random even integer between 0 and 99998.
    stats.firstTurn = stats.currentTurn;
    stats.openRows = [0, 0, 0, 0, 0, 0, 0];
    stats.history = "";
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
    if (Math.random() > 0.5) {
      stats.iAmRed = true;
    }
    else {
      stats.iAmRed = false;
    }
  }

  // Records a move in the given column.
  function move(col) {

    // Update the timing properties if we're using time control.
    var moveEnd = new Date().getTime();
    if (stats.moveStart != null) {
      if (stats.future[0] == "r") {
        stats.redTime -= moveEnd - stats.moveStart;
      }
      else {
        stats.bluTime -= moveEnd - stats.moveStart;
      }
      stats.moveStart = moveEnd;
    }

    // Update the non-timing properties.
    stats.currentTurn += 1;
    stats.history += stats.future[0] + col + stats.openRows[col];
    stats.openRows[col] += 1;
    stats.future = "";
    for (let i = 0; i < 8; i++) {
      if (thueMorse(stats.firstTurn) ^ thueMorse(stats.currentTurn + i) == 0) stats.future += "r";
      else stats.future += "b";
    }

    // Update the winning properties.
    if (isWinningMove()) {
      if (stats.history.slice(-3, -2) == "r") {
        stats.winner = "Red";
      }
      else {
        stats.winner = "Blue";
      }
      stats.winBy = "connection";
    }
  }

  // Stops the game on a timeout.
  function timeout() {

    // Update the timing properties if we're using time control.
    var moveEnd = new Date().getTime();
    if (stats.moveStart != null) {
      if (stats.future[0] == "r") {
        stats.redTime -= moveEnd - stats.moveStart;
      }
      else {
        stats.bluTime -= moveEnd - stats.moveStart;
      }
      stats.moveStart = moveEnd;
    }

    // Update the winning properties.
    if (stats.future[0] == "r") {
      stats.winner = "Blue";
    }
    else {
      stats.winner = "Red";
    }
    stats.winBy = "timeout";
  }

  // Resign, with the resigning player determined from iAmRed.
  function resign() {

    // Update the timing properties if we're using time control.
    var moveEnd = new Date().getTime();
    if (stats.moveStart != null) {
      if (stats.future[0] == "r") {
        stats.redTime -= moveEnd - stats.moveStart;
      }
      else {
        stats.bluTime -= moveEnd - stats.moveStart;
      }
      stats.moveStart = moveEnd;
    }

    // Update the winning properties.
    if (stats.iAmRed) {
      stats.winner = "Blue";
    }
    else {
      stats.winner = "Red";
    }
    stats.winBy = "resignation";
  }

  // Make all the stats null.
  function clear() {
    newStats = {
      currentTurn: null,
      firstTurn: null,
      openRows: null,
      history: null,
      future: null,
      iAmRed: null,
      moveStart: null,
      redTime: null,
      bluTime: null,
      winner: null,
      winBy: null,
    };
    Object.assign(stats, newStats);
  }

  return {
    stats: stats,
    assign: assign,
    start: start,
    move: move,
    timeout: timeout,
    resign: resign,
    clear: clear,
  };
};
