define([
    'mock/config'
], function (
    mockConfig
) {
    mockConfig.set({
        fronts: {
            uk: {
                collections: ['latest', 'sport'],
                description: 'Broken news',
                title: 'UK',
                priority: 'test'
            }
        },
        collections: {
            'latest': {
                displayName: 'Latest News',
                type: 'fast/slow'
            },
            'sport': {
                displayName: 'Sport',
                groups: ['short', 'tall', 'grande', 'venti'],
                type: 'slow/slower/slowest'
            }
        }
    });
});
