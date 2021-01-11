module.exports = {
    "presets": [
        "@babel/preset-react"
    ],
    "plugins": [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-syntax-dynamic-import"
    ],
    "env": {
        "production": {
            "presets": [
                ["@babel/preset-env", {
                    "modules": false
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
                    "modules": false
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
                "dynamic-import-node",
            ],
        },
        "internal": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": {
                        "browsers": [
                            "last 2 Chrome versions",
                            "last 1 Safari version",
                            "last 2 Firefox versions",
                            "last 2 Edge versions",
                        ],
                    }
                }],
            ],
        },
    },
    "ignore": [
        "eslintrc.js",
    ],
};
