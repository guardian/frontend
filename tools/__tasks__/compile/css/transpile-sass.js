module.exports = {
    description: 'Transpile Sass',
    task: [{
        description: 'Old IE',
        task: 'grunt sass:old-ie'
    }, {
        description: 'IE9',
        task: 'grunt sass:ie9'
    }, {
        description: 'Modern',
        task: 'grunt sass:modern'
    }, {
        description: 'Inline',
        task: 'grunt sass:inline'
    }],
    concurrent: true
};
