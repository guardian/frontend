/* Lo-Dash Template Loader v1.0.1
 * Copyright 2015, Tim Branyen (@tbranyen).
 * loader.js may be freely distributed under the MIT license.
 */
(function(global) {
"use strict";

// Cache used to map configuration options between load and write.
var buildMap = {};

// Alias the correct `nodeRequire` method.
var nodeRequire = typeof requirejs === "function" && requirejs.nodeRequire;

// Strips trailing `/` from url fragments.
var stripTrailing = function(prop) {
  return prop.replace(/(\/$)/, '');
};

// Define the plugin using the CommonJS syntax.
define(function(require, exports) {
  var template = require("lodash/utilities/template");
  var clone    = require("lodash/objects/clone");
  var extend   = require("lodash/objects/assign");
  var templateSettings = require("lodash/utilities/templateSettings");

  exports.version = "1.0.1";

  // Invoked by the AMD builder, passed the path to resolve, the require
  // function, done callback, and the configuration options.
  exports.load = function(name, req, load, config) {
    var isDojo;

    // Dojo provides access to the config object through the req function.
    if (!config) {
      config = require.rawConfig;
      isDojo = true;
    }

    var contents = "";
    var settings = configure(config);

    // If the baseUrl and root are the same, just null out the root.
    if (stripTrailing(config.baseUrl) === stripTrailing(settings.root)) {
      settings.root = '';
    }

    var url = req.toUrl(settings.root + name + settings.ext);

    if (isDojo && url.indexOf(config.baseUrl) !== 0) {
      url = stripTrailing(config.baseUrl) + url;
    }

    // Builds with r.js require Node.js to be installed.
    if (config.isBuild) {
      // If in Node, get access to the filesystem.
      var fs = nodeRequire("fs");

      try {
        // First try reading the filepath as-is.
        contents = String(fs.readFileSync(url));
      } catch(ex) {
        // If it failed, it's most likely because of a leading `/` and not an
        // absolute path.  Remove the leading slash and try again.
        if (url.slice(0, 1) === "/") {
          url = url.slice(1);
        }

        // Try reading again with the leading `/`.
        contents = String(fs.readFileSync(url));
      }

      // Read in the file synchronously, as RequireJS expects, and return the
      // contents.  Process as a Lo-Dash template.
      buildMap[name] = template(contents);

      return load();
    }

    // Create a basic XHR.
    var xhr = new XMLHttpRequest();

    // Wait for it to load.
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var templateSettings = clone(settings.templateSettings);

        // Attach the sourceURL.
        templateSettings.sourceURL = url;

        // Process as a Lo-Dash template and cache.
        buildMap[name] = template(xhr.responseText);

        // Return the compiled template.
        load(buildMap[name]);
      }
    };

    // Initiate the fetch.
    xhr.open("GET", url, true);
    xhr.send(null);
  };

  // Also invoked by the AMD builder, this writes out a compatible define
  // call that will work with loaders such as almond.js that cannot read
  // the configuration data.
  exports.write = function(pluginName, moduleName, write) {
    var template = buildMap[moduleName].source;

    // Write out the actual definition
    write(strDefine(pluginName, moduleName, template));
  };

  // This is for curl.js/cram.js build-time support.
  exports.compile = function(pluginName, moduleName, req, io, config) {
    configure(config);

    // Ask cram to fetch the template file (resId) and pass it to `write`.
    io.read(moduleName, write, io.error);

    function write(template) {
      // Write-out define(id,function(){return{/* template */}});
      io.write(strDefine(pluginName, moduleName, template));
    }
  };

  // Crafts the written definition form of the module during a build.
  function strDefine(pluginName, moduleName, template) {
    return [
      "define('", pluginName, "!", moduleName, "', ", "['lodash'], ",
        [
          "function(_) {",
            "return ", template, ";",
          "}"
        ].join(""),
      ");\n"
    ].join("");
  }

  function configure(config) {
    // Default settings point to the project root and using html files.
    var settings = extend({
      ext: ".html",
      root: config.baseUrl,
      templateSettings: {}
    }, config.lodashLoader);

    // Ensure the root has been properly configured with a trailing slash,
    // unless it's an empty string or undefined, in which case work off the
    // baseUrl.
    if (settings.root && settings.root.slice(-1) !== "/") {
      settings.root += "/";
    }

    // Set the custom passed in template settings.
    extend(templateSettings, settings.templateSettings);

    return settings;
  }
});

})(typeof global === "object" ? global : this);
