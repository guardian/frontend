define('config', function() {
    return {
        env: 'test',
        priority: 'test',
        editions: ['uk','us','au'],
        navSections: ['news', 'uk-news', 'us-news', 'au-news'],
        email: '',
        avatarUrl: '',
        lowFrequency: 60,
        highFrequency: 2,
        standardFrequency: 5
    };
});

define('fixed-containers', function () {
    return [
        {'name':'fixed/test'}
    ];
});

define('dynamic-containers', function () {
    return [
        {'name':'dynamic/test'}
    ];
});
