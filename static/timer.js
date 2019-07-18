// Here are the functions that deal with the timer.
var timer = (function() {

  // Initialize some "private" variables.
  var redStart = Number.NEGATIVE_INFINITY;      // The start time (in ms) of each color's most recent move/pair of moves.
  var bluStart = Number.NEGATIVE_INFINITY;
  var redTime = 0;                  // The time elapsed (in ms) for each color, NOT INCLUDING THE ACTIVE TIMING INTERVAL.
  var bluTime = 0;
  var handle = 0; // This is a reference to the repeating code that runs the timer. It is zero when the timer is stopped.

  // Grab some "private" document elements.
  var startBtn = document.getElementById("start"); // Timer start and reset buttons, duh.
  var resetBtn = document.getElementById("reset");
  var redDiv = document.getElementById("red-div"); // Times are displayed in these two divs.
  var bluDiv = document.getElementById("blu-div");

  // "Private" function that helps with times().
  function convert(ms) {
    var min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    var sec = Math.floor((ms % (1000 * 60)) / 1000);
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    return min + ':' + sec;
  }

  // "Private" function that helps with start().
  function times() {
    var redString, bluString;
    var currentTime = new Date().getTime();
    // Red is in the middle of making a move.
    if (redStart > bluStart) {
      redString = convert(redTime + currentTime - redStart);
      bluString = convert(bluTime);
    }
    // Blu is in the middle of making a move.
    else {
      redString = convert(redTime);
      bluString = convert(bluTime + currentTime - bluStart);
    }
    return [redString, bluString];
  }

  function start() {
    var currentTime = new Date().getTime();
    redStart = currentTime;
    // –This block is the thing that constantly updates the page's timer display.–
    handle = setInterval(function() {
      var yeet = times();
      redDiv.innerHTML = yeet[0];
      bluDiv.innerHTML = yeet[1];
      console.log("running");
    }, 100);
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    console.log("start");
  }

  function flip() {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (redStart > bluStart) {
      redTime += currentTime - redStart;
      bluStart = currentTime;
    }
    // Blu is completing its move.
    else if (redStart < bluStart) {
      bluTime += currentTime - bluStart;
      redStart = currentTime;
    }
    // Hopefully redStart and bluStart are never equal...
    console.log("flip");
  }

  function stop() {
    clearInterval(handle);
    handle = 0;
    redStart = Number.NEGATIVE_INFINITY;
    bluStart = Number.NEGATIVE_INFINITY;
    redTime = 0;
    bluTime = 0;
    redDiv.innerHTML = "00:00";
    bluDiv.innerHTML = "00:00";
  }

  function isRunning() {
    return handle != 0;
  }

  return {
    start: start,
    flip: flip,
    stop: stop,
    isRunning: isRunning,
  };
})();
