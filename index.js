// Express is a module, app is an INSTANCE of that module.
var express = require('express');
var app = express();

// Connect to the database.
var pgp = require('pg-promise')();
var cn = {
  host: '127.0.0.1',
  port: 5432,
  database: 'tmc4node',
  user: 'postgres',
  password: 'carpedm'
};
var db = pgp(cn);
module.exports = db; // Not sure what this line does tbh...

// Test query.
db.any('SELECT * FROM testgame LIMIT 1').then(function(data) {
  console.log(data[0]);
}).catch(function(error) {
  console.log("problem!");
});

// Middleware?
app.use(express.static('static'));

// Routes.
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

// Start up a server listening on port 8000.
var server = app.listen(8000, function() {
  console.log("listening on port 8000!");
});

// mount socket.io onto our server
var io = require('socket.io')(server);

// Handle websocket connections.
io.on('connection', function(socket) {

  // Connection check.
  console.log('a user connected!');

  socket.on('stats request', function() {
    db.any('SELECT * FROM testgame LIMIT 1').then(function(data) {
      io.emit('stats', data[0]);
      console.log('stats sent to client!');
    });
  });

  socket.on('stats', function(gameStats) {
    db.none('UPDATE testgame SET "history" = $1, "openRows" = $2, "currentTurn" = $3, "future" = $4, "firstTurn" = $5, "isGameOver" = $6',
    [gameStats.history, gameStats.openRows, gameStats.currentTurn, gameStats.future, gameStats.firstTurn, gameStats.isGameOver]);
    io.emit('stats', gameStats);
    console.log('stats sent to client!');
  });

  // disconnection check
  socket.on('disconnect', function() {
    console.log('a user disconnected!');
  });
});
