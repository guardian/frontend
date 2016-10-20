module.exports = [{
    title: 'Transpile Sass',
    task: [{
        title: 'Old IE',
        task: 'grunt sass:old-ie'
    }, {
        title: 'IE9',
        task: 'grunt sass:ie9'
    }, {
        title: 'Modern',
        task: 'grunt sass:modern'
    }, {
        title: 'Inline',
        task: 'grunt sass:inline'
    }],
    concurrent: true
}];
