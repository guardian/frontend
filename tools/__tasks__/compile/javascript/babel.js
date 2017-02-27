const execa = require("execa");

const { src, transpiled } = require("../../config").paths;

module.exports = {
    description: "Transpile",
    task: () =>
        execa(
            "babel",
            [`${src}/javascripts`, "--out-dir", `${transpiled}/javascripts`],
            {
                env: {
                    BABEL_ENV: "production",
                },
            }
        ),
};
