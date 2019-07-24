const expect = require("chai").expect;
const request = require("request");
const jsdom = require("jsdom");
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
});
