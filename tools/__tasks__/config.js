const path = require('path');

module.exports = {
    paths: {
        target: path.join(__dirname, '../', '../', 'static', 'target'),
        transpiled: path.join(__dirname, '../', '../', 'static', 'transpiled'),
        hash: path.join(__dirname, '../', '../', 'static', 'hash'),
        src: path.join(__dirname, '../', '../', 'static', 'src'),
        public: path.join(__dirname, '../', '../', 'static', 'public'),
        root: path.join(__dirname, '../', '../'),
        conf: path.join(__dirname, '../', '../', 'common', 'conf', 'assets'),
    },
};
