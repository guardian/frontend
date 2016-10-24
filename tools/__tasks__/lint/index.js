const thisFile = require('path').basename(__filename);

module.exports = {
    description: 'Lint assets',
    task: require('fs').readdirSync(__dirname)
        .filter(module => module !== thisFile)
        .map(module => require(`./${module}`)),
    concurrent: true
};
