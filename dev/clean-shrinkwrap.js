#!/usr/bin/env node

// Copied from https://github.com/angular/angular.js/blob/master/scripts/npm/clean-shrinkwrap.js

/**
 * this script is just a temporary solution to deal with the issue of npm outputting the npm
 * shrinkwrap file in an unstable manner.
 *
 * See: https://github.com/npm/npm/issues/3581
 */

var _ = require('lodash');
var sorted = require('sorted-object');
var fs = require('fs');
var path = require('path');


function cleanModule(module, name) {

  // keep `resolve` properties for git dependencies, delete otherwise
  delete module.from;
  if (!(module.resolved
        && (module.resolved.match(/^git(\+[a-z]+)?:\/\//) || module.resolved.match(/^https?:\/\/github.com\//)))) {
    delete module.resolved;
  }

  _.forEach(module.dependencies, function(mod, name) {
    cleanModule(mod, name);
  });
}


console.log('- reading npm-shrinkwrap.json');
var shrinkwrapPath = path.join(__dirname, '..', 'npm-shrinkwrap.json');
var shrinkwrap = require(shrinkwrapPath);

console.log('- cleaning it');
cleanModule(shrinkwrap, shrinkwrap.name);

console.log('- saving it to', shrinkwrapPath);
fs.writeFileSync(shrinkwrapPath, JSON.stringify(sorted(shrinkwrap), null, 2) + "\n");
