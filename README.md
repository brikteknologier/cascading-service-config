# Cascading Service Config

is a format for a versatile configuration file that configures more than one
http service in a single system.

## What does it do?

* Extract a configuration for a single service from a global configuration file.
* Supply access points to each of the other services in the system, that are
  configured in the global configuration file.
* Inherit configurations of modules that are shared between services.

## Install

```
npm install cascading-service-config
```

## Example

Lets say we have an example config with two services and an authentication
module (which requires a config) that both services depend on, as well as some
shared settings. Our config might look like this:

```javascript
var configSource = {
  logmethod: "syslog", // a shared setting
  auth: {
    cookie: "authKey",
    storage: {
      type: "redis",
      location: "localhost:6789"
    }
  },
  service1: {
    port: 8402,
    logmethod: "loggly",
    wibblewobbles: true
  },
  service2: {
    port: 8403
  }
}
```

Now we can give this to CSC, as well as a domain - the domain is just the name
of the service which is currently reading the config.

```javascript
var config = require('cascading-service-config')(configSource, 'service1');
```

Now we have our config object. The properties which you have access to look like
this (but this is different to what you'll get if you `console.log` it, as we
are making using of prototypical inheritance):

```javascript
{ 
  logmethod: "loggly", // note that we overrode the shared setting here
  auth: { 
    service1: "http://localhost:8402",
    service2: "http://localhost:8403",
    logmethod: "syslog",
    auth: [circular reference],
    cookie: "authKey", 
    storage: { type: "redis", location: "localhost:6789" } 
  },
  service1: "http://localhost:8402",
  service2: "http://localhost:8403",
  wibblewobbles: true,
  port: 8402
}
```

### So what's happening here?

Because we specified `service1` as our domain, that's is our top-level config
object. All properties in the `service1` object of the config source are passed
verbatim to the final config.

However, under this, we have two objects which we inherit.

1. `{ service1: "http://localhost:8402", service2: "http://localhost:8403" }` -
   CSC looks through each of the objects on the root level of the config. If an
   object has a `port` setting, it is assumed to be a service. This object
   consists of assembled access points for each of the other services in your
   domain, so that they're easily accessible on your config.
2. The original config. This is the base prototype.

Also note that each other object on the root config also gains the same prototype
chain, so in our example, `auth` also gained the service locations.

In our example, the prototype chain looks something like this:

```javascript
      { wibblewobbles: true, logmethod: "loggly", port: 8402 }
//                          inherits...
  { service1: "http://localhost:8402", service2: "http://localhost:8403" }
//                          inherits...
  { auth: { ... }, logmethod: "syslog", service1: { ... }, service2: { ... } }
```

### My other services aren't running on `http` or `localhost`

No problem! There's two special config options you can use to configure this:
`internalServiceHostname` and `internalServiceProtocol`. You can configure this
globally or per-object. In our example, we could set:

```javascript
{
  logmethod: "syslog"
  internalServiceHostname: "amazing.service.com",
  internalServiceProtocol: "https",
  ...
```

Which, in our final config, would result in...

```javascript
console.log(config.service2);
// -> 'https://amazing.service.com:8403'
```

But what if service1 is running on http, not https? Well, we can override the
root `internalServiceProtocol` in `service1`'s config:

```javascript
  ...
  service1: {
    internalServiceProtocol: "http",
    port: 8402,
    ...
```

Resulting in...

```
console.log(config.service1);
// -> 'http://amazing.service.com:8402'
console.log(config.service2);
// -> 'https://amazing.service.com:8403'
```

### Can I access the config of other services?

It's possible, but very much discouraged (as you'll see from the syntax). Config
formats change, and depending upon another service's config format is usually a 
pretty bad idea.

However, if you absolutely must do it, there are two ways.

You could access the source config object by traversing the prototype chain:

```javascript
console.log(config.__proto__.__proto__.service2.port);
// -> 8403
```

Or you could just call CSC again and specify the domain of the other service:

```javascript
var service2config = require('cascading-service-config')(configSource, 'service2');
console.log(service2config.port);
// -> 8403
```
