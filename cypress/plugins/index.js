// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

var client = require("socket.io-client");

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on("task", {

    // Add a socket to the room with the given id.
    socket(id) {
      return new Promise(function(resolve) {
        var socket = client("http://localhost:8000");
        socket.emit("join room", id);
        socket.on("room joined", function() {
          resolve(null);
        });
      });
    },

    // Make a socket that emits "my name" with the given id and name.
    name({id, name}) {
      var socket = client("http://localhost:8000");
      socket.emit("my name", id, name);
      return null;
    },

    // Make a socket that emits "my game" with the given id and game.
    game({id, game}) {
      var socket = client("http://localhost:8000");
      socket.emit("my game", id, game);
      return null;
    }
  });
};
