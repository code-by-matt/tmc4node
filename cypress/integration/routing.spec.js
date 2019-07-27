describe("Routing.", function() {
  it("Should display the welcome page.", function() {
    cy.visit("http://localhost:8000");
    cy.get("title");
  });
});