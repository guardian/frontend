#!/usr/bin/env node
var fs = require("fs");
var UglifyJS = require("uglify-js");

var copyright = fs.readFileSync("promiscuous.js", "utf8").match(/.*\n/)[0];
var minified = copyright + UglifyJS.minify("promiscuous.js").code;
var browserified = minified.replace("module.exports", "Promise")
                           .replace("setImmediate", "setTimeout");

var path = "dist/";
if(!fs.existsSync(path))
  fs.mkdirSync(path);

fs.writeFileSync(path + "promiscuous-node.js", minified);
fs.writeFileSync(path + "promiscuous-browser.js", browserified);
fs.writeFileSync(path + "promiscuous-shim.js",
                 browserified.replace("!", "(typeof Promise)[0]!='u'||"));
