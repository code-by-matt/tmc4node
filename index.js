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

// Handle websocket connections. Requests go from client to server, responses go from server to client.
io.on('connection', function(socket) {

  // Connection check.
  console.log('a user connected!');

  socket.on('move request', function(game) {
    db.none('UPDATE testgame SET "history" = $1, "openRows" = $2, "currentTurn" = $3, "future" = $4, "firstTurn" = $5, "isGameOver" = $6',
    [game.history, game.openRows, game.currentTurn, game.future, game.firstTurn, game.isGameOver]);
    io.emit('move response', game);
    console.log('move recorded, game sent to client!');
  });

  socket.on('reset request', function(game) {
    db.none('UPDATE testgame SET "history" = $1, "openRows" = $2, "currentTurn" = $3, "future" = $4, "firstTurn" = $5, "isGameOver" = $6',
    [game.history, game.openRows, game.currentTurn, game.future, game.firstTurn, game.isGameOver]);
    io.emit('reset response', game);
    console.log('reset recorded, game sent to client!');
  });

  socket.on('start request', function() {
    io.emit('start response');
    console.log('start recorded, games started!');
  });

  socket.on('join request', function(id) {
    socket.join('ROOM');
    db.any('SELECT * FROM testgame LIMIT 1').then(function(data) {
      io.to(id).emit('join response', data[0]);
      console.log('someone joined the room!');
    });
    io.emit('population response', io.sockets.adapter.rooms['ROOM'].length);
    console.log('population: ' + io.sockets.adapter.rooms['ROOM'].length);
  });

  // disconnection check
  socket.on('disconnect', function() {
    console.log('a user disconnected!');
  });
});
