// SETUP –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Express is a module, app is an INSTANCE of that module.
var express = require("express");
var app = express();

// Start up a server listening on port 8000.
var server = app.listen(process.env.PORT || 8000, function() {
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
      response.render("game", {id: request.query.id, first: true});
    }
    else if (io.sockets.adapter.rooms[request.query.id].length == 1) { // Second to join this room.
      console.log("second to join room " + request.query.id);
      response.render("game", {id: request.query.id, first: false});
    }
    else { // Third connection cannot join!
      console.log("cannot join room " + request.query.id + ", it is full!");
      response.render("game-not-found");
    }
  }
});

// HANDLING SOCKETS ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

io.on("connection", function(socket) {

  // Emits with "my" are from client to server, emits with "their" are from server to client.
  socket.on("my", function(type, thing, id) {
    console.log(type + " " + JSON.stringify(thing));
    socket.broadcast.to(id).emit("their", type, thing);
  });

  socket.on("join room", function(id) {
    socket.join(id);
    socket.emit("room joined");
  });

  socket.on("leave room", function(id) {
    socket.leave(id);
  });

  // disconnection check
  // socket.on("disconnect", function() {
  //   console.log("a user disconnected!");
  // });
});
