module.exports = {
    entry: `${__dirname}/app/main.js`,
    output: {
        path: 'static/target/deploys-radiator',
        filename: 'main.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
};
