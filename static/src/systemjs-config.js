System.config({
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime"
    ],
    "blacklist": []
  },
  paths: {
    "*": "javascripts/*",
    "admin/*": "javascripts/projects/admin/*",
    "common/*": "javascripts/projects/common/*",
    "facia/*": "javascripts/projects/facia/*",
    "membership/*": "javascripts/projects/membership/*",
    "bundles/*": "bundles/*",
    "test/*": "javascripts/test/*",
    "es6/*": "javascripts/es6/*",
    "bootstraps/*": "javascripts/bootstraps/*",
    "vendor/*": "javascripts/vendor/*",
    "svgs/*": "inline-svgs/*.svg",
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*",
    "bower:*": "jspm_packages/bower/*",
    "facebook.js": "//connect.facebook.net/en_US/all",
    "foresee.js": "javascripts/vendor/foresee/20150703/foresee-trigger"
  },

  map: {
    "EventEmitter": "github:Wolfy87/EventEmitter@4.2.11",
    "Promise": "github:cujojs/when@3.7.3/es6-shim/Promise",
    "babel": "npm:babel-core@5.8.23",
    "babel-runtime": "npm:babel-runtime@5.8.20",
    "bean": "npm:bean@1.0.15",
    "bonzo": "npm:bonzo@1.4.0",
    "classnames": "npm:classnames@1.2.0",
    "core-js": "npm:core-js@1.1.1",
    "domready": "npm:domready@1.0.8",
    "enhancer": "github:guardian/enhancer@0.1.3",
    "fastdom": "github:wilsonpage/fastdom@0.8.6",
    "fence": "github:guardian/fence@0.2.11",
    "lodash": "npm:lodash@2.4.1",
    "omniture": "vendor/omniture",
    "picturefill": "common/utils/picturefill",
    "qwery": "npm:qwery@3.4.2",
    "raven": "github:getsentry/raven-js@1.1.18",
    "react": "npm:react@0.13.2",
    "reqwest": "github:ded/reqwest@1.1.5",
    "socketio": "github:Automattic/socket.io-client@1.1.0",
    "stripe": "vendor/stripe/stripe.min",
    "svg": "es6/projects/common/utils/svg",
    "system-script": "github:rich-nguyen/systemjs-script-plugin@0.1.10",
    "text": "github:systemjs/plugin-text@0.0.2",
    "videojs": "github:videojs/video.js@5.0.0",
    "videojsads": "github:guardian/videojs-contrib-ads@3.0.0",
    "videojsembed": "github:guardian/videojs-embed@0.3.3",
    "videojsima": "github:guardian/videojs-ima@0.2.1",
    "videojspersistvolume": "github:guardian/videojs-persistvolume@0.1.3",
    "videojsplaylist": "github:guardian/videojs-playlist@0.1.0",
    "when": "github:cujojs/when@3.7.3",
    "zxcvbn": "github:dropbox/zxcvbn@v1.0",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.2.2"
    },
    "github:jspm/nodelibs-events@0.1.0": {
      "events-browserify": "npm:events-browserify@0.0.1"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:amdefine@0.1.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "module": "github:jspm/nodelibs-module@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.20": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:bean@1.0.15": {
      "fs": "github:jspm/nodelibs-fs@0.1.2"
    },
    "npm:bonzo@1.4.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:buffer@3.2.2": {
      "base64-js": "npm:base64-js@0.0.8",
      "ieee754": "npm:ieee754@1.1.5",
      "is-array": "npm:is-array@1.0.1"
    },
    "npm:classnames@1.2.0": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:core-js@1.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:core-util-is@1.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:envify@3.4.0": {
      "jstransform": "npm:jstransform@10.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "through": "npm:through@2.3.7"
    },
    "npm:esprima-fb@13001.1001.0-dev-harmony-fb": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:events-browserify@0.0.1": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:jstransform@10.1.0": {
      "base62": "npm:base62@0.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "esprima-fb": "npm:esprima-fb@13001.1001.0-dev-harmony-fb",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "source-map": "npm:source-map@0.1.31"
    },
    "npm:lodash@2.4.1": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:qwery@3.4.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:react@0.13.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "envify": "npm:envify@3.4.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:readable-stream@1.1.13": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.1",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:source-map@0.1.31": {
      "amdefine": "npm:amdefine@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.13"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:through@2.3.7": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});
