// SETUP –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Express is a module, app is an INSTANCE of that module.
var express = require('express');
var app = express();

// Start up a server listening on port 8000.
var server = app.listen(8000, function() {
  console.log("listening on port 8000!");
});

// Mount socket.io onto our server.
var io = require('socket.io')(server);

// Connect to the database.
var pgp = require('pg-promise')();
var cn = {
  host: '127.0.0.1',
  port: 5432,
  database: 'tmc4node',
  user: 'postgres',
  password: 'carpedm',
};
var db = pgp(cn);
module.exports = db; // Not sure what this line does tbh...

// MIDDLEWARE ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Allow Express to access static files.
app.use(express.static('static'));

// Allow Express to parse POST requests. Not necessary???
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Use Pug as our template engine.
app.set('views', './views');
app.set('view engine', 'pug');

// ROUTING –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

app.get('/', function(request, response) {
  response.render('index');
});
app.get('/new', function(request, response) {
  response.render('new');
});
app.get('/join', function(request, response) {
  response.render('join');
});
app.get('/game', function(request, response) {
  if (request.query.id.length > 16) { // Security check, prevent people from sending requests with crazy long ids.
    response.render("game-not-found");
  }
  else {
    if (io.sockets.adapter.rooms[request.query.id] == undefined) { // First to join this room.
      console.log("first to join this room");
      response.render('game', {id: request.query.id});
    }
    else if (io.sockets.adapter.rooms[request.query.id].length == 1) { // Second to join this room.
      console.log("second to join this room");
      response.render('game', {id: request.query.id});
    }
    else { // Third connection cannot join!
      console.log("cannot join game, it is full!");
      response.render("game-not-found");
    }
  }
});
app.get('/game-not-found', function(request, response) {
  response.render('game-not-found');
});

// HANDLING SOCKETS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

io.on('connection', function(socket) {

  // Connection check.
  console.log('a user connected!');

  socket.on('join room', function(id) {
    socket.join(id);
    console.log('joined game ' + id);
  });

  socket.on("my name", function(id, name) {
    socket.broadcast.to(id).emit("their name", name);
  });

  socket.on("sync pls", function(id) {
    socket.broadcast.to(id).emit("sync pls", id);
  });

  socket.on("here ya go", function(id, name) {
    socket.broadcast.to(id).emit("here ya go", name);
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
