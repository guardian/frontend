/*global phantom:true window:true*/

var fs = require('fs');

var page = require('webpage').create();

var url = phantom.args[0] + "#generate_expected=1";

page.onCallback = function(msg) {
  var content = "// FILE GENERATED AUTOMATICALLY. DO NOT MODIFY THIS FILE. THIS FILE IS GIT-IGNORED.\n";
  content += "window.expectedBehavior = \n" + msg.data + ";";
  fs.write(phantom.args[1], content);
  phantom.exit();
};

page.onError = function(e) {
  throw(e);
};

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

var loaded;
page.open(url, function(status) {
  if(!loaded) {
    loaded = true;

    if(status !== "success") {
      throw "Bad status '" + status + "'";
    }
    console.log('Page loaded.');
    page.evaluate(function() {
      window.QUnit.done(function() {
        console.log('Tests done.');
        window.callPhantom({
          type: 'expected',
          data: JSON.stringify(window.nativeBehavior)
        });
      });
    });
  }
});

