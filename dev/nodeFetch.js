// Enable fetch in node environment
global.fetch = require('node-fetch');
global.Headers = require('node-fetch').Headers;

// Not supported before Node 12, delete afterwards
global.Object.fromEntries = (iterable) =>
    [...iterable].reduce((obj, [key, val]) => {
      obj[key] = val
      return obj
    }, {})
