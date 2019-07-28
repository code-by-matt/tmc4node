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

    // Add one socket to the room with the given id.
    one(id) {
      return new Promise(function(resolve) {
        var socket = client("http://localhost:8000");
        socket.emit("join room", id);
        socket.on("room joined", function() {
          resolve(null);
        });
      });
    },

    // Add two sockets to the room with the given id.
    two(id) {
      return new Promise(function(resolve) {
        var socket1 = client("http://localhost:8000");
        socket1.emit("join room", id);
        socket1.on("room joined", function() {
          var socket2 = client("http://localhost:8000");
          socket2.emit("join room", id);
          socket2.on("room joined", function() {
            resolve(null);
          });
        });
      });
    }
  });
};
