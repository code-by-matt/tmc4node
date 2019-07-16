# Real-Time Thue-Morse Connect Four
Hi! My name's Matt. Welcome to my game!

In regular Connect Four, two players take turns dropping pieces into the board with the goal of forming a line of four pieces of their color in any direction. With perfect play, the first player can always force a win. I wanted to make a version of Connect Four without out a first player advantage, so instead of alternating turns, I based the turns off of the Thue-Morse sequence, which is in some sense the "most fair" turn sequence.

The turn sequence is such that players often get to play twice in a row, but never get to play three or more times in a row. Furthermore, if a game fills every square on the board, the board will alway be filled with 21 red pieces and 21 blue pieces. Every time you start a new game, the turn counter jumps to a random point in the Thue-Morse sequence and then increments as pieces are played.

I made a version of this game that you can play with a friend here: https://code-by-matt.github.io/connect4/. This here repository is where I'm making a new version that will allow players on two different devices to play each other in real-time. Let me know what you think!

