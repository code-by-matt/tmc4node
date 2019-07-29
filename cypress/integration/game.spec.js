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

describe("Names.", function() {

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
});
