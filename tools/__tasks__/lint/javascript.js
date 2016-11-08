module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Lint tests',
        task: 'eslint static/test/javascripts/**/*.js --ignore-path static/test/javascripts/.eslintignore --rulesdir dev/eslint-rules --quiet --color'
    },{
        description: 'Lint app JS',
        task: 'eslint static/src/**/*.js --ignore-path static/src/.eslintignore --rulesdir dev/eslint-rules --quiet --color'
    }],
    concurrent: true
};
