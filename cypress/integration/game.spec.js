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

  it("Should start a game.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("#my-name-panel")
      .type("BoJack{enter}");
    cy.get('[for="thr-min"]')
      .click();
    cy.get('[for="ready"]')
      .click()
      .log("name BoJack?")
      .log("message three minutes?")
      .log("message ready?")
      .pause();
    cy.task("my", {type: "name", thing: "Princess Carolyn", id: id});
    cy.task("my", {type: "message", thing: "ten minutes", id: id});
    cy.task("my", {type: "message", thing: "ready", id: id});
    cy.get("#their-name-panel")
      .should("have.text", "Princess Carolyn");
    cy.get("#ten-min")
      .should("be.checked");
    cy.get("#ready")
      .should("not.be.checked");
    cy.get('[for="ready"]')
      .click();
    cy.get("#start-panel")
      .should("not.be.visible");
    cy.get("#play-panel")
      .should("not.be.visible");
  });

  // it("Should start a game.", function() {
  //   var id = Math.random().toString(36).substr(6);
  //   cy.visit("http://localhost:8000/game?id=" + id);
  //   cy.task("name", {id: id, name: "Bertie"});
  //   cy.get("#my-name-input")
  //     .type("BoJack{enter}");
  //   cy.get("#marquee")
  //     .should("have.text", "3...");
  //   cy.get("#marquee")
  //     .should("have.text", "3... 2...");
  //   cy.get("#marquee")
  //     .should("have.text", "3... 2... 1...");
  //   cy.get("#marquee")
  //     .should("have.text", "Play!");
  //   cy.log("Check for 'my game' in server log!")
  //     .pause();
  //   var game = {
  //     history: "r22r33r42b43b32b23",
  //     future: "rrbbrrbb",
  //   };
  //   cy.task("game", {id: id, game: game});
  //   cy.log("Check that game pattern is correct!")
  //     .pause();
  // });
});
