// Here are the functions that operate purely on the game data, not on any document elements.
var logic = (function() {

  // "Private" function that helps with isWin().
  function count(game, up, right) {
    var color = game.history.slice(-3, -2);
    var col = parseInt(game.history.slice(-2, -1));
    var row = parseInt(game.history.slice(-1));
    var count = 0;
    var move = color + col + row
    while (game.history.includes(move)) {
      col += right;
      row += up;
      move = color + col + row;
      count++;
    }
    return count;
  }

  // "Private" win-checker that helps with update().
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

  // "Private" function that calculates the nth Thue-Morse number, helps with reset() and update().
  function thueMorse(n) {
    var count = 0
    while (n != 0) {
      n = n & (n - 1);
      count++;
    }
    return count % 2;
  }

  function reset(game) {
    game.history = '';
    game.openRows = [0, 0, 0, 0, 0, 0, 0];
    game.firstTurn = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
    // game.firstTurn = 0;
    game.currentTurn = game.firstTurn;
    game.future = '';
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
  }

  function update(game, col) {
    var row = game.openRows[col];
    game.history += game.future[0] + col + row;
    game.openRows[col] += 1;
    game.currentTurn += 1;
    game.future = '';
    for (let i = 0; i < 8; i++) {
      if (thueMorse(game.firstTurn) ^ thueMorse(game.currentTurn + i) == 0) game.future += "r";
      else game.future += "b";
    }
    game.isOver = isWin(game);
  }

  return {
    reset: reset,
    update: update,
  }
})();
