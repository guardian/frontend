// just grab everything out of './rules'
const path = require('path');
module.exports.rules = require('requireindex')(
    path.resolve(__dirname, 'rules')
);
