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
db.any('SELECT * FROM users', [true]).then(function(data) {
  console.log(data);
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
  console.log('a user connected!');
  socket.on('move', function(gameConfig) {
    console.log('YAY THIS WORKS');
    io.emit('move', gameConfig);
  });
  socket.on('disconnect', function() {
    console.log('a user disconnected!');
  });
});
