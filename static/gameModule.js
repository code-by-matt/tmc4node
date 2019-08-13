// Here is a "class" representing a stats.
const gameModule = function() {

  // The stats object is the only thing that is emitted by sockets.
  stats = {

    // We call these the pre-start properties.
    theyAreReady: false, // A Boolean that states whether or not my opponent is ready to start. It's SWAPPED with iAmReady when the opponent receives our game stats.
    theirName: null,     // A string that is my opponent's name. It's SWAPPED with myName when my opponent receives our game stats.
    iAmReady: false,     // A Boolean that states whether or not I am ready to start. It's SWAPPED with theyAreReady when the opponent receives our game stats.
    myName: null,        // A string that is my name. It's SWAPPED with theirName when the opponent receives our game stats.
    timeControl: null,   // An integer that is the amount of time (in min) each player gets for this game.

    // We call these the non-timing properties.
    currentTurn: null,   // An integer that is the position in the Thue-Morse sequence where the game is now.
    firstTurn: null,     // An integer that is the position in the Thue-Morse sequence where the game started.
    openRows: null,      // An integer array where element i is the lowest open row in column i of the board.
    history: null,       // A string representing the squares on the board, in the order they were played.
    future: null,        // A string of the colors of the next eight moves.
    iAmRed: null,        // A Boolean that tells me if I'm red. It's REVERSED when the opponent receives our game stats.

    // We call these the timing properties.
    moveStart: null,     // The moment in time (in ms) at which the current move started, whether it be red or blu.
    redTime: null,       // The amount of time (in ms) that red has spent playing, excluding the current move.
    bluTime: null,       // The amount of time (in ms) that blu has spent playing, excluding the current move.

    // We call these the winning properties.
    winner: null,        // The winner of the game. Either "Red", "Blue", or null.
    winBy: null,         // How the game was won. Either "connection", "timeout", "resignation", or null.

    // We call these the post-win properties.
    theyWantMore: false, // A Boolean that states whether or not my opponent wants to rematch. It's SWAPPED with iWantMore when the opponent receives our game stats.
    iWantMore: false,    // A Boolean that states whether or not I want to rematch. It's SWAPPED with theyWantMore when the opponent receives our game stats.
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

  // States if the game is ready to start.
  function isReadyToStart() {
    return stats.myName != null && stats.theirName != null && stats.timeControl != null && stats.iAmReady && stats.theyAreReady;
  }

  // States if the game is in progress AND if the given column is a legal place to move.
  function isLegalMove(col) {
    return stats.moveStart != null && stats.openRows[col] < 6 && stats.winner == null;
  }
  
  // Updates game stats with given new stats, altering as necessary.
  function assign(newStats) {

    // Flip iAmRed.
    newStats.iAmRed = !newStats.iAmRed;

    // Swap names.
    var temp = newStats.myName;
    newStats.myName = newStats.theirName;
    newStats.theirName = temp;

    // Swap readinesses.
    temp = newStats.iAmReady;
    newStats.iAmReady = newStats.theyAreReady;
    newStats.theyAreReady = temp;

    // Swap desires to rematch.
    temp = newStats.iWantMore;
    newStats.iWantMore = newStats.theyWantMore;
    newStats.theyWantMore = temp;

    // Update our stats.
    Object.assign(stats, newStats);
  }
  
  // Starts a game with the given time control.
  function start() {

    // Initialize the timing properties.
    stats.moveStart = new Date().getTime();
    if (stats.timeControl == 1) {
      stats.redTime = 60000;
      stats.bluTime = 60000;
    }
    else if (stats.timeControl == 3) {
      stats.redTime = 180000;
      stats.bluTime = 180000;
    }
    else if (stats.timeControl == 10) {
      stats.redTime = 600000;
      stats.bluTime = 600000;
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
    if (stats.timeControl != -1) {
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
    if (stats.timeControl != -1) {
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
    if (stats.timeControl != -1) {
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

  // Resets all the stats EXCEPT myName, theirName, and timeControl.
  function clear() {
    newStats = {
      theyAreReady: false,
      iAmReady: false,
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
      theyWantMore: false,
      iWantMore: false,
    };
    Object.assign(stats, newStats);
  }

  return {
    stats: stats,
    isReadyToStart: isReadyToStart,
    isLegalMove: isLegalMove,
    assign: assign,
    start: start,
    move: move,
    timeout: timeout,
    resign: resign,
    clear: clear,
  };
};
