System.config({
  "baseURL": "/assets",
  "paths": {
    "*": "js/*.js",
    "facia-tool/*": "js/*.js",
    "npm:*": "jspm_packages/npm/*.js",
    "github:*": "jspm_packages/github/*.js"
  }
});

System.config({
  "map": {
    "EventEmitter": "npm:wolfy87-eventemitter@4.2.11",
    "css": "github:systemjs/plugin-css@0.1.0",
    "font-awesome": "npm:font-awesome@4.2.0",
    "jquery": "github:components/jquery@2.1.3",
    "jquery-mockjax": "npm:jquery-mockjax@1.6.1",
    "jquery-ui": "github:jquery/jquery-ui@1.11.2",
    "knockout": "npm:knockout@3.2.0",
    "raven-js": "github:getsentry/raven-js@1.1.16",
    "sinon": "npm:sinon@1.12.2",
    "text": "github:systemjs/plugin-text@0.0.2",
    "underscore": "npm:underscore@1.7.0",
    "github:jspm/nodelibs-fs@0.1.0": {
      "assert": "npm:assert@1.3.0",
      "fs": "github:jspm/nodelibs-fs@0.1.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.0": {
      "process": "npm:process@0.10.0"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:formatio@1.1.1": {
      "process": "github:jspm/nodelibs-process@0.1.0",
      "samsam": "npm:samsam@1.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:jquery-mockjax@1.6.1": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:jquery-ui@1.10.5": {
      "fs": "github:jspm/nodelibs-fs@0.1.0"
    },
    "npm:jquery@2.1.3": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:knockout@3.2.0": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:raven-js@1.1.11": {
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:sinon@1.12.2": {
      "formatio": "npm:formatio@1.1.1",
      "lolex": "npm:lolex@1.1.0",
      "process": "github:jspm/nodelibs-process@0.1.0",
      "util": "npm:util@0.10.3"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:wolfy87-eventemitter@4.2.11": {
      "fs": "github:jspm/nodelibs-fs@0.1.0"
    }
  }
});

