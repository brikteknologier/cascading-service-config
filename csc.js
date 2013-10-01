var url = require('url');
module.exports = function(config, domain) {
  config = JSON.parse(JSON.stringify(config));

  var services = Object.create(config);

  Object.keys(config).forEach(function(key) {
    if (typeof config[key] != 'object' || Array.isArray(config[key])) return;
    config[key].__proto__ = services;
    if (config[key].port == null) return;
    services[key] = url.format({
      port: config[key].port,
      hostname: config[key].internalServiceHostname || 'localhost',
      protocol: config[key].internalServiceProtocol || 'http'
    });
  });

  return config[domain] || config;
};
