// Here are the functions that deal with the timer.
var wobbly = (function() {

  // Grab some "private" document elements.
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
  function times(timer) {
    var redString, bluString;
    var currentTime = new Date().getTime();
    // Red is in the middle of making a move.
    if (timer.redStart > timer.bluStart) {
      redString = convert(timer.redTime + currentTime - timer.redStart);
      bluString = convert(timer.bluTime);
    }
    // Blu is in the middle of making a move.
    else {
      redString = convert(timer.redTime);
      bluString = convert(timer.bluTime + currentTime - timer.bluStart);
    }
    return [redString, bluString];
  }

  function start(timer) {
    var currentTime = new Date().getTime();
    timer.redStart = currentTime;
    // –This block is the thing that constantly updates the page's timer display.–
    timer.handle = setInterval(function() {
      var yeet = times(timer);
      redDiv.innerHTML = yeet[0];
      bluDiv.innerHTML = yeet[1];
      console.log("running");
    }, 100);
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    console.log("start");
  }

  function flip(timer) {
    var currentTime = new Date().getTime();
    // Red is completing its move.
    if (timer.redStart > timer.bluStart) {
      timer.redTime += currentTime - timer.redStart;
      timer.bluStart = currentTime;
    }
    // Blu is completing its move.
    else if (timer.redStart < timer.bluStart) {
      timer.bluTime += currentTime - timer.bluStart;
      timer.redStart = currentTime;
    }
    // Hopefully timer.redStart and timer.bluStart are never equal...
    console.log("flip");
  }

  function stop(timer) {
    clearInterval(timer.handle);
    timer.handle = 0;
    timer.redStart = Number.NEGATIVE_INFINITY;
    timer.bluStart = Number.NEGATIVE_INFINITY;
    timer.redTime = 0;
    timer.bluTime = 0;
    redDiv.innerHTML = "00:00";
    bluDiv.innerHTML = "00:00";
  }

  function isRunning(timer) {
    return timer.handle != 0;
  }

  return {
    start: start,
    flip: flip,
    stop: stop,
    isRunning: isRunning,
  };
})();
