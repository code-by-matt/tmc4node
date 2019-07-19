// SETUP –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Express is a module, app is an INSTANCE of that module.
var express = require("express");
var app = express();

// Start up a server listening on port 8000.
var server = app.listen(8000, function() {
  console.log("listening on port 8000!");
});

// Mount socket.io onto our server.
var io = require("socket.io")(server);

// MIDDLEWARE ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Allow Express to access static files.
app.use(express.static("static"));

// Use Pug as our template engine.
app.set("views", "./views");
app.set("view engine", "pug");

// ROUTING –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

app.get("/", function(request, response) {
  response.render("index");
});
app.get("/game", function(request, response) {
  if (request.query.id.length > 16) { // Security check, prevent people from sending requests with crazy long ids.
    response.render("game-not-found");
  }
  else {
    if (io.sockets.adapter.rooms[request.query.id] == undefined) { // First to join this room.
      console.log("first to join room " + request.query.id);
      response.render("game", {id: request.query.id});
    }
    else if (io.sockets.adapter.rooms[request.query.id].length == 1) { // Second to join this room.
      console.log("second to join room " + request.query.id);
      response.render("game", {id: request.query.id});
    }
    else { // Third connection cannot join!
      console.log("cannot join room " + request.query.id + ", it is full!");
      response.render("game-not-found");
    }
  }
});

// HANDLING SOCKETS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

io.on("connection", function(socket) {

  socket.on("join room", function(id) {
    socket.join(id);
  });

  socket.on("leave room", function(id) {
    socket.leave(id);
  });

  socket.on("my name", function(senderGame, senderName) {
    socket.broadcast.to(senderGame.id).emit("their name", senderName);
  });

  socket.on("my countdown", function(id) {
    socket.broadcast.to(id).emit("their countdown");
  });

  socket.on("my game", function(senderGame) {
    socket.broadcast.to(senderGame.id).emit("their game", senderGame);
  });

  socket.on("my timer", function(id, senderTimer) {
    socket.broadcast.to(id).emit("their timer", senderTimer);
  });

  socket.on("sync pls", function(id) {
    socket.broadcast.to(id).emit("sync pls", id);
  });

  socket.on("here ya go", function(senderGame, senderTimer, senderName, receiverName) {
    socket.broadcast.to(senderGame.id).emit("here ya go", senderGame, senderTimer, senderName, receiverName);
  });

  // disconnection check
  socket.on("disconnect", function() {
    console.log("a user disconnected!");
  });
});
