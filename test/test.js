var csc = require('../');
var assert = require('assert');

var lolconfig = {
  "neo4j": "http://localhost:7474/",
  "internalServiceHostname": "localhost",
  "internalServiceProtocol": "http",
  "stoutmeal": {
    "cookie": "authKey",
    "store": {
      "type": "redis",
      "host": "localhost",
      "port": 6379
    }
  },
  "stout": {
    "defaultUrl": "http://lol.com",
    "port": 6005,
    "cookieDomain": "localhost"
  },
  "sahti": {
    "port": 6003
  }
};

describe('CSC', function() {
  it('should access basic config settings', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.port, 6005);
    assert.equal(config.cookieDomain, "localhost");
    assert.equal(config.defaultUrl, "http://lol.com");
  });
  it('should inherit values on the root object', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.neo4j, 'http://localhost:7474/');
  });
  it('should inherit non-service objects on the root object', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.stoutmeal.cookie, 'authKey');
    assert.equal(config.stoutmeal.store.type, 'redis');
  });
  it('should transform root service objects to their location', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.sahti, 'http://localhost:6003');
  });
  it('non-service root objects should also inherit service locations', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.stoutmeal.stout, 'http://localhost:6005');
  });
});
