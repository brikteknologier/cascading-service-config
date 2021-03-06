var csc = require('../');
var assert = require('assert');

var lolconfig = {
  "neo4j": "http://localhost:7474/",
  "internalServiceHostname": "localhost",
  "internalServiceProtocol": "http",
  "arrayOfThings": [1,2,3],
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
  it('shouldnt mangle the prototype chain of arrays', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.arrayOfThings.forEach, [].forEach);
  });
  it('should transform root service objects to their location', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.sahti, 'http://localhost:6003');
  });
  it('should return root config when given domain doesnt exist', function() {
    var config = csc(lolconfig, 'potato');
    assert.equal(config.sahti.port, 6003);
  });
  it('non-service root objects should also inherit service locations', function() {
    var config = csc(lolconfig, 'stout');
    assert.equal(config.stoutmeal.stout, 'http://localhost:6005');
  });
  it('should be able to configure service access points, per service', function() {
    var newconf = JSON.parse(JSON.stringify(lolconfig));
    newconf.sahti.internalServiceProtocol = 'https';
    var config = csc(newconf, 'stout');
    assert.equal(config.stout, 'http://localhost:6005');
    assert.equal(config.sahti, 'https://localhost:6003');
  });
});
