const expect = require("chai").expect;
const request = require("request");
const jsdom = require("jsdom");
const io = require("socket.io-client");
const {JSDOM} = jsdom;

describe("Routing.", function() {
  it("Should display the welcome page.", function(done) {
    request.get("http://localhost:8000", function(error, response, body) {
      var dom = new JSDOM(body);
      var title = dom.window.document.querySelector("title").textContent;
      expect(title).to.equal("TMC4 | Welcome!");
      done();
    });
  });
  it("Should display a game for the first player.", function(done) {
    var id = Math.random().toString(36).substr(6);
    request.get("http://localhost:8000/game?id=" + id, function(error, response, body) {
      var dom = new JSDOM(body);
      var title = dom.window.document.querySelector("title").textContent;
      expect(title).to.equal("TMC4 | Play!");
      done();
    });
  });
  it("Should display a game for the second player.", function(done) {
    var id = Math.random().toString(36).substr(6);
    var socket = io("http://localhost:8000");
    socket.emit("join room", id);
    socket.on("room joined", function() {
      request.get("http://localhost:8000/game?id=" + id, function(error, response, body) {
        var dom = new JSDOM(body);
        var title = dom.window.document.querySelector("title").textContent;
        expect(title).to.equal("TMC4 | Play!");
        socket.disconnect();
        done();
      });
    });
  });
  it("Should NOT a game for the second player.", function(done) {
    var id = Math.random().toString(36).substr(6);
    var socket1 = io("http://localhost:8000");
    socket1.emit("join room", id);
    socket1.on("room joined", function() {
      var socket2 = io("http://localhost:8000");
      socket2.emit("join room", id);
      socket2.on("room joined", function() {
        request.get("http://localhost:8000/game?id=" + id, function(error, response, body) {
          var dom = new JSDOM(body);
          var title = dom.window.document.querySelector("title").textContent;
          expect(title).to.equal("TMC4 | Game Not Found!");
          socket1.disconnect();
          socket2.disconnect();
          done();
        });
      });
    });
  });
});

describe("Names.", function() {
  it("Should work in this order: first connect, first name, second connect, second name.", function(done) {
    var id = Math.random().toString(36).substr(6);
    request.get("http://localhost:8000/game?id=" + id, function(error, response, body) {
      var dom = new JSDOM(body, {
        url: "http://localhost:8000",
        runScripts: "dangerously",
        resources: "usable",
      });
      var name = dom.window.document.getElementById("my-name-input");
      name.textContent = "test name";
      expect(name.textContent).to.equal("test name");
      dom.window.close();
      done();
    });
  });
});
