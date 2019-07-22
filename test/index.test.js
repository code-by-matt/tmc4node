const expect = require("chai").expect;
const request = require("request");

describe("Routing.", function() {
  it("Should be truthy.", function() {
    request("http://localhost:8000", function(error, response, body) {
      console.log(body);
    });
    expect(true).to.equal(true);
  });
});
