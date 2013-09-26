require("smoosh").config({
    "JAVASCRIPT": {
        "DIST_DIR": "./"
      , "bean": [
            "./src/copyright.js"
          , "./src/bean.js"
        ]
    }
  , "JSHINT_OPTS": {
        "predef": [ "assert", "refute", "define", "self" ]
      , "boss": true
      , "bitwise": false
      , "shadow": true
      , "trailing": true
      , "immed": true
      , "latedef": true
      , "forin": false
      , "curly": false
      , "debug": true
      , "devel": false
      , "evil": true
      , "regexp": false
      , "undef": true
      , "sub": true
      , "asi": true
      , "laxbreak": true
      , "eqnull": true
      , "browser": true
      , "node": true
      , "laxcomma": true
      , "proto": true
      , "expr": true
      , "es5": false
      , "strict": false
      , "quotmark": true
      , "camelcase": true
    }
}).run().build().analyze()
