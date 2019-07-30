/// <reference types="Cypress" />

describe("Routing.", function() {

  it("Should display the welcome page.", function() {
    cy.visit("http://localhost:8000");
    cy.get("title")
      .should("have.text", "TMC4 | Welcome!");
  });

  it("Should display a game for the first player.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("title")
      .should("have.text", "TMC4 | Play!");
  });

  it("Should display a game for the second player.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.task("socket", id);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("title")
      .should("have.text", "TMC4 | Play!");
  });

  it("Should NOT display a game for the third player.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.task("socket", id);
    cy.task("socket", id);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("title")
      .should("have.text", "TMC4 | Game Not Found!");
  });
});

describe("Gameplay.", function() {

  it("Should write my name and their name.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("#my-name-input")
      .type("BoJack{enter}")
      .log("Check for 'my name' in server log!")
      .pause();
    cy.get("#my-name")
      .should("have.text", "BoJack");
    cy.task("name", {id: id, name: "Princess Carolyn"});
    cy.get("#their-name")
      .should("have.text", "Princess Carolyn");
  });

  it("Should start a game.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.task("name", {id: id, name: "Bertie"});
    cy.get("#my-name-input")
      .type("BoJack{enter}");
    cy.get("#marquee")
      .should("have.text", "3...");
    cy.get("#marquee")
      .should("have.text", "3... 2...");
    cy.get("#marquee")
      .should("have.text", "3... 2... 1...");
    cy.get("#marquee")
      .should("have.text", "Play!");
    cy.log("Check for 'my game' in server log!")
      .pause();
    var game = {
      history: "r22r33r42b43b32b23",
      future: "rrbbrrbb",
    };
    cy.task("game", {id: id, game: game});
    cy.log("Check that game pattern is correct!")
      .pause();
  });
});
