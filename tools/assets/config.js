const path = require('path');

module.exports = {
    paths: {
        target: path.join(__dirname, '../../', 'static', 'target'),
        hash: path.join(__dirname, '../../', 'static', 'hash'),
        sprites: path.join(__dirname, '../', 'sprites')
    }
};
