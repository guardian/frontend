const path = require('path');

module.exports = {
    paths: {
        target: path.join(__dirname, '../', '../', 'static', 'target'),
        hash: path.join(__dirname, '../', '../', 'static', 'hash'),
        static: path.join(__dirname, '../', '../', 'static'),
        root: path.join(__dirname, '../', '../')
    }
};
