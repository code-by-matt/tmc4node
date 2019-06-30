// express is a module, app is an INSTANCE of that module
var express = require('express');
var app = express();

// connect to the database
var pgp = require('pg-promise')();
var cn = {
  host: '127.0.0.1',
  port: 5432,
  database: 'tmc4node',
  user: 'postgres',
  password: 'carpedm'
};
var db = pgp(cn);
module.exports = db; // not sure what this line does tbh...

// test query
db.any('SELECT * FROM testgame LIMIT 1').then(function(data) {
  console.log(data[0]);
}).catch(function(error) {
  console.log("problem!");
});

// middleware?
app.use(express.static('static'));

// routes
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

// start up a server listening on post 8000
var server = app.listen(8000, function() {
  console.log("listening on port 8000!");
});

// mount socket.io onto our server
var io = require('socket.io')(server);

// handle websocket connections
io.on('connection', function(socket) {

  // connection check
  console.log('a user connected!');

  // when a move is received, update gameStats in database, then emit gameStats
  socket.on('move', function(gameStats) {
    // add code to put this gameStats into the database
    console.log('YAY THIS WORKS');
    io.emit('move', gameStats);
  });

  // when a reset is received, reset gameStats in database, then emit gameStats
  socket.on('reset', function() {
    var red = Math.random() > 0.5;
    var rows = [0, 0, 0, 0, 0, 0, 0];
    var turn = Math.floor(Math.random() * 5000) * 2; // random even integer between 0 and 99998
    db.none('UPDATE testgame SET "history" = $1, "isRedsTurn" = $2, "openRows" = $3, "turnNumber" = $4', ['', red, rows, turn]);
    console.log('reset!');
  });

  // disconnection check
  socket.on('disconnect', function() {
    console.log('a user disconnected!');
  });
});
