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

  it("Should look nice on an iPhone 5.", function() {
    cy.viewport("iphone-5");
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id)
      .pause();
  });

  it("Should play a game.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("#start-panel .my-name")
      .type("BoJack{enter}");
    cy.get('[for="thr-min"]')
      .click();
    cy.get('[for="ready"]')
      .click()
      .log("sender name BoJack?")
      .log("message three minutes?")
      .log("message ready?")
      .pause();
    cy.task("my", {type: "sender name", thing: "Carolyn", id: id});
    cy.task("my", {type: "message", thing: "ten minutes", id: id});
    cy.task("my", {type: "message", thing: "ready", id: id});
    cy.get("#start-panel .their-name")
      .should("have.text", "Carolyn");
    cy.get("#ten-min")
      .should("be.checked");
    cy.get("#ready")
      .should("not.be.checked");
    cy.get('[for="ready"]')
      .click()
      .log("message transfer names?")
      .log("message sender is red/blue?")
      .log("game stats [object Object]?")
      .log("message hide-hide animation?")
      .pause();
    cy.get("#start-panel")
      .should("not.be.visible");
    cy.get("#play-panel")
      .should("not.be.visible");
    cy.task("my", {type: "message", thing: "sender is blue", id: id});
    var stats = {
      history: "r30r31r32",
      openRows: [0, 0, 0, 3, 0, 0, 0],
    };
    cy.task("my", {type: "game stats", thing: stats, id: id});
    cy.get("#board-img").click(200, 25);
    cy.get("#end-panel")
      .should("be.visible");
  });
});
