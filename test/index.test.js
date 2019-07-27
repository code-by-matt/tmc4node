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

describe("Player's own name.", function() {

  it("Should display once written.", function(done) {
    var id = Math.random().toString(36).substr(6);
    request.get("http://localhost:8000/game?id=" + id, function(error, response, body) {
      var dom = new JSDOM(body, {
        url: "http://localhost:8000",
        runScripts: "dangerously",
        resources: "usable",
      });
      var myNameInput = dom.window.document.getElementById("my-name-input");
      myNameInput.value = "BoJack";
      setTimeout(function() { // For some reason we gotta pause a bit on this change event.
        myNameInput.dispatchEvent(new dom.window.Event("change"));
      }, 10);
      dom.window.addEventListener("my name", function() {
        var myNameDiv = dom.window.document.getElementById("my-name");
        expect(myNameDiv.textContent).to.equal("BoJack");
        dom.window.close();
        done();
      });
    });
  });
});
