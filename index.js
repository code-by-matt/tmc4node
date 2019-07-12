// Express is a module, app is an INSTANCE of that module.
var express = require('express');
var app = express();

// Middleware.
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

// Use Pug for templates.
app.set('views', './views');
app.set('view engine', 'pug');

// Mount socket.io onto our server.
var io = require('socket.io')(server);

// Routing.
app.get('/', function(request, response) {
  response.render('index');
});
app.get('/new', function(request, response) {
  response.render('new');
});
app.get('/join', function(request, response) {
  response.render('join');
});
app.post('/play', function(request, response) {
  if (request.body.id == null) { // Creating a new game.
    id = Math.random().toString(36).substr(6);
    db.none('INSERT INTO games ("id", "red") VALUES ($1, $2)', [id, request.body.name]).then(function() {
      response.render('play', {
        name: request.body.name,
        opponent: "???",
        id: id,
      });
    }).catch(function(error) {
      console.log(error);
    });
  }
  else { // Joining an existing game.
    db.any('SELECT * FROM games WHERE "id" = $1', [request.body.id]).then(function(data) {
      if (data.length == 0) {
        response.redirect('/game-not-found');
      }
      else {
        db.none('UPDATE games SET "blue" = $1 WHERE "id" = $2', [request.body.name, request.body.id]).then(function() {
          response.render('play', {
            name: request.body.name,
            opponent: data[0].red,
            id: request.body.id,
          });
        }).catch(function(error) {
          console.log(error);
        });
      }
    }).catch(function(error) {
      console.log(error);
    });
  }
});
app.get('/game-not-found', function(request, response) {
  response.render('game-not-found');
});

// Start up a server listening on port 8000.
var server = app.listen(8000, function() {
  console.log("listening on port 8000!");
});

// Handle websocket connections. Requests go from client to server, responses go from server to client.
io.on('connection', function(socket) {

  // Connection check.
  console.log('a user connected!');

  socket.on('reset request', function(game) {
    db.none('UPDATE testgame SET "history" = $1, "openRows" = $2, "currentTurn" = $3, "future" = $4, "firstTurn" = $5, "isGameOver" = $6',
    [game.history, game.openRows, game.currentTurn, game.future, game.firstTurn, game.isGameOver]);
    io.emit('reset response', game);
    console.log('reset recorded, game sent to client!');
  });

  socket.on('join room', function(id) {
    socket.join(id);
    console.log('player joined room ' + id);
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
