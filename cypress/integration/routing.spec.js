/// <reference types="Cypress" />
var io = require("socket.io-client");

describe("Routing.", function() {

  it("Should display the welcome page.", function() {
    cy.visit("http://localhost:8000");
    cy.get("title").should("have.text", "TMC4 | Welcome!");
  });

  it("Should display a game for the first player.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("title").should("have.text", "TMC4 | Play!");
  });

  it("Should display a game for the second player.", function() {
    var id = Math.random().toString(36).substr(6);
    var socket = io("http://localhost:8000");
    socket.emit("join room", id);
    socket.on("room joined", function() {
      cy.visit("http://localhost:8000/game?id=" + id);
      cy.get("title").should("have.text", "TMC4 | Play!");
    });
  });
});
