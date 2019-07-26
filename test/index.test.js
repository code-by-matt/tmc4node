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
      var dom = new JSDOM(body, {
        url: "http://localhost:8000",
        runScripts: "dangerously",
        resources: "usable",
      });
      var title = dom.window.document.querySelector("title").textContent;
      expect(title).to.equal("TMC4 | Play!");
      dom.window.close();
      done();
    });
  });

  it("Should display a game for the second player.", function(done) {
    var id = Math.random().toString(36).substr(6);
    request.get("http://localhost:8000/game?id=" + id, function(error, response, body1) {
      var dom1 = new JSDOM(body1, {
        url: "http://localhost:8000",
        runScripts: "dangerously",
        resources: "usable",
      });
      dom1.window.addEventListener("joined", function() {
        request.get("http://localhost:8000/game?id=" + id, function(error, response, body2) {
          var dom2 = new JSDOM(body2, {
            url: "http://localhost:8000",
            runScripts: "dangerously",
            resources: "usable",
          });
          var title = dom2.window.document.querySelector("title").textContent;
          expect(title).to.equal("TMC4 | Play!");
          dom1.window.close();
          dom2.window.close();
          done();
        });
      });
    });
  });

  it("Should NOT display a game for the third player.", function(done) {
    var id = Math.random().toString(36).substr(6);
    request.get("http://localhost:8000/game?id=" + id, function(error, response, body1) {
      var dom1 = new JSDOM(body1, {
        url: "http://localhost:8000",
        runScripts: "dangerously",
        resources: "usable",
      });
      dom1.window.addEventListener("joined", function() {
        request.get("http://localhost:8000/game?id=" + id, function(error, response, body2) {
          var dom2 = new JSDOM(body2, {
            url: "http://localhost:8000",
            runScripts: "dangerously",
            resources: "usable",
          });
          dom2.window.addEventListener("joined", function() {
            request.get("http://localhost:8000/game?id=" + id, function(error, response, body3) {
              var dom3 = new JSDOM(body3, {
                url: "http://localhost:8000",
                runScripts: "dangerously",
                resources: "usable",
              });
              var title = dom3.window.document.querySelector("title").textContent;
              expect(title).to.equal("TMC4 | Game Not Found!");
              dom1.window.close();
              dom2.window.close();
              dom3.window.close();
              done();
            });
          });
        });
      });
    });
  });
});

describe("Names.", function() {
  it("Should receive own name.", function(done) {
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
