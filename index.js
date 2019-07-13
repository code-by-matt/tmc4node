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

<<<<<<< HEAD
app.get('/play', function(request, response) {
  response.sendFile(__dirname + '/static/play.html');
  response.send(request.query);
  console.log(request.query);
});

app.get('/new', function(request, response) {
  response.sendFile(__dirname + '/static/new.html');
});

// Start up a server listening on port 8000.
var server = app.listen(8000, function() {
  console.log("listening on port 8000!");
=======
// Allow Express to parse POST requests.
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Use Pug as our template engine.
app.set('views', './views');
app.set('view engine', 'pug');

// When a player creates a game, create a row in the database with
// as little information as possible, cuz a second player may never show up.
function createGame(request, response, next) {
  if (request.body.id != null) {
    next();
  }
  else {
    db.one('INSERT INTO games ("id", "red") VALUES ($1, $2) RETURNING "id"',
    [Math.random().toString(36).substr(6), request.body.name]).then(function(data) {
      response.render('play', {
        id: data.id,
        player: request.body.name,
        firstTurn: -1,
      });
    }).catch(function(error) {
      console.log(error);
    });
  }
}

// When a player tries to joins a game, throw the rest of the initial game state
// at the database. If the data lands in a row, then that game exists. If the data
// lands nowhere, redirect to an error page.
function joinGame(request, response) {
  db.oneOrNone('UPDATE games SET "blu" = $1, "firstTurn" = $2 WHERE "id" = $3 RETURNING "red", "blu", "firstTurn"',
  [request.body.name, Math.floor(Math.random() * 5000) * 2, request.body.id]).then(function(data) {
    if (data == null) {
      response.redirect('/game-not-found');
    }
    else {
      var opponent = data.red;
      // Maybe swap red and blu. This means that the database's red and blu might be wrong,
      // but this is fixed once the game ends and the database updates.
      if (Math.random() > 0.5) {
        var temp = data.red;
        data.red = data.blu;
        data.blu = temp;
      }
      io.to(request.body.id).emit('sync', data); // This gives data to the player who created the game.
      response.render('play', {
        id: request.body.id,
        player: request.body.name,
        opponent: opponent,
        red: data.red,
        blu: data.blu,
        firstTurn: data.firstTurn,
      });
    }
  }).catch(function(error) {
    console.log(error);
  });
}

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
app.get('/play', function(request, response) {
  response.render('play');
});
app.post('/play', [createGame, joinGame]);
app.get('/game-not-found', function(request, response) {
  response.render('game-not-found');
>>>>>>> dev
});

// HANDLING SOCKETS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

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

  socket.on('join room', function(id) {
    if (io.sockets.adapter.rooms == undefined) { // First connection ever.
      socket.join(id);
      console.log('joined game ' + id);
    }
    else if (io.sockets.adapter.rooms[id] == undefined) { // First to join this room.
      socket.join(id);
      console.log('first to join game ' + id);
    }
    else if (io.sockets.adapter.rooms[id].length == 1) { // Second to join this room.
      socket.join(id);
      console.log('second to join game ' + id);
    }
    else { // Third connection cannot join!
      console.log('cannot join game ' + id + ', it is full!');
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
