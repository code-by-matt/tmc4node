const expect = require("chai").expect;
const request = require("request");
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

describe("Routing.", function() {
  it("Should display the welcome page.", function(done) {
    request.get("http://localhost:8000", function(error, response, body) {
      var dom = new JSDOM(body, {runScripts: "dangerously"});
      var title = dom.window.document.querySelector("title").textContent;
      expect(title).to.equal("TMC4 | Welcome!");
      done();
    });
  });
});
