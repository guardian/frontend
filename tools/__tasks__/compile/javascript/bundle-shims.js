const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const pify = require("pify");
const uglify = require("uglify-js");

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

const { target } = require("../../config").paths;

const dest = path.resolve(target, "javascripts");

module.exports = {
    description: "Bundle shivs and shims",
    task: () => {
        mkdirp.sync(dest);
        return Promise.all(
                [
                    require.resolve("es5-shim"),
                    require.resolve("html5shiv"),
                    path.resolve(
                        path.dirname(require.resolve("JSON2")),
                        "json2.js"
                    ),
                ].map(file => readFileP(file, "utf8"))
            )
            .then(srcs => srcs.join(";"))
            .then(src => uglify.minify(src, { fromString: true }).code)
            .then(src => writeFileP(path.resolve(dest, "es5-html5.js"), src));
    },
};
