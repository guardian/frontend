module.exports = {
    "presets": [
        "@babel/preset-react",
        "@babel/preset-flow"
    ],
    "plugins": [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-syntax-dynamic-import"
    ],
    "env": {
        "production": {
            "presets": [
                ["@babel/preset-env", {
                    "modules": false,
                      "targets": {
                        "esmodules": true
                    }
                }]
            ],
            "plugins": [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties",
            ],
        },
        "development": {
            "presets": [
                ["@babel/preset-env", {
                    "modules": false,
                      "targets": {
                        "esmodules": true
                    }
                }]
            ],
            "plugins": [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties",
            ],
        },
        "test": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": {
                        "node": "current"
                    }
                }]
            ],
            "plugins": [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties",
            ],
        },

    },
    "ignore": [
        "eslintrc.js",
    ],
};
