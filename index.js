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
app.get("/about", function(request, response) {
  response.render("about");
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

  // For stuff that affects the two players' screens in the same way.
  socket.on("message", function(msg, id) {
    socket.broadcast.to(id).emit("message", msg);
  });

  // For stuff that affects the two players' screens differently.
  socket.on("my", function(type, thing, id) {
    socket.broadcast.to(id).emit("their", type, thing);
  });

  socket.on("join room", function(id) {
    socket.join(id);
    socket.emit("room joined");
  });

  socket.on("leave room", function(id) {
    socket.leave(id);
  });

  socket.on("countdown", function(id) {
    console.log("countdown");
    socket.broadcast.to(id).emit("countdown");
  });

  socket.on("one min", function(id) {
    socket.broadcast.to(id).emit("one min");
  });

  socket.on("my name", function(id, senderName) {
    console.log("my name");
    socket.broadcast.to(id).emit("their name", senderName);
  });

  socket.on("my check", function(id, senderName) {
    console.log("my check");
    socket.broadcast.to(id).emit("their check", senderName);
  });

  socket.on("my game", function(id, senderGame) {
    console.log("my game");
    socket.broadcast.to(id).emit("their game", senderGame);
  });

  // socket.on("sync pls", function(id) {
  //   socket.broadcast.to(id).emit("sync pls");
  // });

  // socket.on("here ya go", function(id, senderGame, senderName, receiverName) {
  //   socket.broadcast.to(id).emit("here ya go", senderGame, senderName, receiverName);
  // });

  // disconnection check
  // socket.on("disconnect", function() {
  //   console.log("a user disconnected!");
  // });
});
