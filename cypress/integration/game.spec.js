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

  // // Note that certain received stats will be flipped, but our sync task does NOT flip any stats!

  it("Should look nice on an iPhone 5.", function() {
    cy.viewport("iphone-5");
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id)
      .pause();
  });

  it("Should receive and show games correctly.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("#loading")
      .should("not.be.visible");

    // Check a game that hasn't started.
    cy.task("my", {type: "game stats", thing: {
      theyAreReady: true,
      theirName: "BoJack",
      iAmReady: false,
      myName: "Carolyn",
      timeControl: 10,
      iAmRed: null,
      theyWantMore: false,
      iWantMore: false,
    }, id: id});
    cy.get("#start")
      .should("be.visible");
    cy.get("#play")
      .should("not.be.visible");
    cy.get("#end")
      .should("not.be.visible");
    cy.get("#rematch")
      .should("not.be.visible");
    cy.get("#start .name").eq(0)
      .should("have.value", "BoJack");
    cy.get("#start .name").eq(1)
      .should("have.text", "Carolyn");
    cy.get("#ready")
      .should("be.checked");
    cy.get("#ten-min")
      .should("be.checked");

    // Check a game that is in progress.
    cy.task("my", {type: "game stats", thing: {
      theyAreReady: true,
      theirName: "BoJack",
      iAmReady: true,
      myName: "Carolyn",
      timeControl: 10,
      currentTurn: 8,
      firstTurn: 0,
      openRows: [0, 0, 1, 4, 3, 0, 0],
      history: "r30b40b41r42b31r32r33b20",
      future: "brrbrbbr",
      iAmRed: false,
      moveStart: new Date().getTime(),
      redTime: 567000,
      bluTime: 587500,
      theyWantMore: false,
      iWantMore: false,
    }, id: id});
    cy.get("#start")
      .should("not.be.visible");
    cy.get("#play")
      .should("not.be.visible");
    cy.get("#end")
      .should("not.be.visible");
    cy.get("#rematch")
      .should("not.be.visible");
    cy.get("#controls .name").eq(0)
      .should("have.text", "BoJack");
    cy.get("#controls .name").eq(1)
      .should("have.text", "Carolyn");
    cy.get("#my-time")
      .should("have.text", "09:27");
    cy.get("#their-time")
      .should("have.text", "09:47");
    cy.get("#number-toggle")
      .click()
      .pause();

    // Check a game that has ended.
    cy.task("my", {type: "game stats", thing: {
      theyAreReady: true,
      theirName: "BoJack",
      iAmReady: true,
      myName: "Carolyn",
      timeControl: 10,
      currentTurn: 8,
      firstTurn: 0,
      openRows: [0, 0, 1, 4, 3, 0, 0],
      history: "r30b40b41r31b42r20r10b43",
      future: "brrbrbbr",
      iAmRed: false,
      moveStart: new Date().getTime(),
      redTime: 567000,
      bluTime: 587500,
      winner: "Blue",
      winBy: "connection",
      theyWantMore: false,
      iWantMore: false,
    }, id: id});
    cy.get("#start")
      .should("not.be.visible");
    cy.get("#play")
      .should("not.be.visible");
    cy.get("#end")
      .should("be.visible");
    cy.get("#rematch")
      .should("be.visible");
    cy.get("#controls .name").eq(0)
      .should("have.text", "BoJack");
    cy.get("#controls .name").eq(1)
      .should("have.text", "Carolyn");
    cy.get("#my-time")
      .should("have.text", "09:27");
    cy.get("#their-time")
      .should("have.text", "09:47");
    cy.get("#end")
      .should("have.text", "Blue wins by connection!")
      .pause();
  });

  it("Should modify and send games correctly.", function() {
    var id = Math.random().toString(36).substr(6);
    cy.visit("http://localhost:8000/game?id=" + id);
    cy.get("#loading")
      .should("not.be.visible");

    // Check initial stats.
    cy.task("sync", id)
      .should("deep.equal", {
        theyAreReady: false,
        theirName: null,
        iAmReady: false,
        myName: null,
        timeControl: null,
        currentTurn: null,
        firstTurn: null,
        openRows: null,
        history: null,
        future: null,
        iAmRed: null,
        moveStart: null,
        redTime: null,
        bluTime: null,
        winner: null,
        winBy: null,
        theyWantMore: false,
        iWantMore: false,
      }
    );

    // Check stats after entering a name.
    cy.get("#start .name").eq(0)
      .type("Diane{enter}");
    cy.task("sync", id)
      .should("deep.equal", {
        theyAreReady: false,
        theirName: null,
        iAmReady: false,
        myName: "Diane",
        timeControl: null,
        currentTurn: null,
        firstTurn: null,
        openRows: null,
        history: null,
        future: null,
        iAmRed: null,
        moveStart: null,
        redTime: null,
        bluTime: null,
        winner: null,
        winBy: null,
        theyWantMore: false,
        iWantMore: false,
      }
    );

    // Check stats after choosing a time control.
    cy.get('[for="thr-min"]')
      .click();
    cy.task("sync", id)
      .should("deep.equal", {
        theyAreReady: false,
        theirName: null,
        iAmReady: false,
        myName: "Diane",
        timeControl: 3,
        currentTurn: null,
        firstTurn: null,
        openRows: null,
        history: null,
        future: null,
        iAmRed: null,
        moveStart: null,
        redTime: null,
        bluTime: null,
        winner: null,
        winBy: null,
        theyWantMore: false,
        iWantMore: false,
      }
    );

    // Check stats after clicking ready.
    cy.get('[for="ready"]')
      .click();
    cy.task("sync", id)
      .should("deep.equal", {
        theyAreReady: false,
        theirName: null,
        iAmReady: true,
        myName: "Diane",
        timeControl: 3,
        currentTurn: null,
        firstTurn: null,
        openRows: null,
        history: null,
        future: null,
        iAmRed: null,
        moveStart: null,
        redTime: null,
        bluTime: null,
        winner: null,
        winBy: null,
        theyWantMore: false,
        iWantMore: false,
      }
    );

    // Check play animation and stats after starting a game.
    cy.task("my", {type: "game stats", thing: {
      theyAreReady: false,
      theirName: "Diane",
      iAmReady: true,
      myName: "Peanutbutter",
      timeControl: 10,
      iAmRed: null,
      theyWantMore: false,
      iWantMore: false,
    }, id: id});
    cy.get('[for="ready"]')
      .click();
    cy.get("#play")
      .should("be.visible");
    cy.task("sync", id).then(function(stats) {
      cy.wrap(stats).its("theyAreReady").should("be.true");
      cy.wrap(stats).its("theirName").should("equal", "Peanutbutter");
      cy.wrap(stats).its("iAmReady").should("be.true");
      cy.wrap(stats).its("myName").should("equal", "Diane");
      cy.wrap(stats).its("timeControl").should("equal", 10);
      cy.wrap(stats).its("currentTurn").should("not.be.null");
      cy.wrap(stats).its("firstTurn").should("not.be.null");
      cy.wrap(stats).its("openRows").should("not.be.null");
      cy.wrap(stats).its("history").should("not.be.null");
      cy.wrap(stats).its("future").should("not.be.null");
      cy.wrap(stats).its("iAmRed").should("not.be.null");
      cy.wrap(stats).its("moveStart").should("not.be.null");
      cy.wrap(stats).its("redTime").should("equal", 600000);
      cy.wrap(stats).its("bluTime").should("equal", 600000);
      cy.wrap(stats).its("winner").should("be.null");
      cy.wrap(stats).its("winBy").should("be.null");
      cy.wrap(stats).its("theyWantMore").should("be.false");
      cy.wrap(stats).its("iWantMore").should("be.false");
    });

    // Check non-timing stats after making a move.
    cy.task("my", {type: "game stats", thing: {
      theyAreReady: true,
      theirName: "Diane",
      iAmReady: true,
      myName: "Peanutbutter",
      timeControl: -1,
      currentTurn: 8,
      firstTurn: 0,
      openRows: [0, 0, 1, 4, 3, 0, 0],
      history: "r30b40b41r42b31r32r33b20",
      future: "brrbrbbr",
      iAmRed: true,
      moveStart: 69,
      redTime: null,
      bluTime: null,
      theyWantMore: false,
      iWantMore: false,
    }, id: id});
    cy.get("#board-img")
      .click(150, 25);
    cy.task("sync", id)
      .should("deep.equal", {
        theyAreReady: true,
        theirName: "Peanutbutter",
        iAmReady: true,
        myName: "Diane",
        timeControl: -1,
        currentTurn: 9,
        firstTurn: 0,
        openRows: [0, 0, 2, 4, 3, 0, 0],
        history: "r30b40b41r42b31r32r33b20b21",
        future: "rrbrbbrb",
        iAmRed: false,
        moveStart: 69,
        redTime: null,
        bluTime: null,
        winner: null,
        winBy: null,
        theyWantMore: false,
        iWantMore: false,
      }
    );
  });

  // it("Should play a game with connection.", function() {
  //   var id = Math.random().toString(36).substr(6);
  //   cy.visit("http://localhost:8000/game?id=" + id);

  //   // Check that interacting with the start panel emits the right things.
  //   cy.get("#start .name").eq(0)
  //     .type("BoJack{enter}");
  //   cy.get('[for="thr-min"]')
  //     .click();
  //   cy.get('[for="ready"]')
  //     .click()
  //     .log("sender name BoJack?")
  //     .log("message three minutes?")
  //     .log("message ready?")
  //     .pause();

  //   // Check that we can receive the opponent's start panel activity.
  //   cy.task("my", {type: "sender name", thing: "Carolyn", id: id});
  //   cy.task("my", {type: "message", thing: "ten minutes", id: id});
  //   cy.task("my", {type: "message", thing: "ready", id: id});
  //   cy.get("#start .name").eq(1)
  //     .should("have.text", "Carolyn");
  //   cy.get("#ten-min")
  //     .should("be.checked");
  //   cy.get("#ready")
  //     .should("not.be.checked");

  //   // Check that the game starts and is emitted when all things are prepared.
  //   cy.get('[for="ready"]')
  //     .click()
  //     .log("message transfer names?")
  //     .log("game stats [object Object]?")
  //     .log("message play animation?")
  //     .pause();
  //   cy.get("#start")
  //     .should("not.be.visible");
  //   cy.get("#play")
  //     .should("not.be.visible");

  //   // Feed in a dummy game, which checks that we can receive a game and forces us to be red.
  //   var stats = {
  //     history: "r30r31r32",
  //     openRows: [0, 0, 0, 3, 0, 0, 0],
  //     iAmRed: false,
  //   };
  //   cy.task("my", {type: "game stats", thing: stats, id: id});

  //   // Make a winning move to check that the game ends.
  //   cy.get("#board-img")
  //     .click(200, 25);
  //   cy.get("#end")
  //     .should("be.visible")
  //     .should("have.text", "Red wins by connection!");
  // });
});
