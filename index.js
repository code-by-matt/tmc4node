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

// Middleware?
app.use(express.static('static'));

// Routes.
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/static/index.html');
});
app.get('/test/', function(request, response) {
  response.sendFile(__dirname + '/static/test.html');
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
    console.log('start response sent!');
  });

  socket.on('new game request', function(game) {
    socket.join(game.id);
    db.none('INSERT INTO games ("id", "history", "future", "openRows", "firstTurn", "currentTurn", "isOver") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [game.id, game.history, game.future, game.openRows, game.firstTurn, game.currentTurn, game.isOver]);
    io.to(game.id).emit('game response', game);
    console.log('game ' + game.id + ' created!');
  });

  socket.on('join game request', function(id) {
    if (io.sockets.adapter.rooms[id].length == 1) {
      socket.join(id);
      db.any('SELECT * FROM games WHERE "id" = $1', [id]).then(function(data) {
        io.to(id).emit('game response', data[0]);
        console.log('joined game ' + id + '!');
      });
    }
  });

  socket.on('update game request', function(game) {
    db.none('UPDATE games SET "history" = $1, "future" = $2, "openRows" = $3, "firstTurn" = $4, "currentTurn" = $5, "isOver" = $6',
    [game.history, game.future, game.openRows, game.firstTurn, game.currentTurn, game.isGameOver]);
    io.to(game.id).emit('game response', game);
    console.log('game ' + game.id + ' updated!');
  });

  // disconnection check
  socket.on('disconnect', function() {
    console.log('a user disconnected!');
  });
});
