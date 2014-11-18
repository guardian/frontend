define([
    'mock-config'
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
                displayName: 'Latest News'
            },
            'sport': {
                displayName: 'Sport',
                groups: ['short', 'tall', 'grande', 'venti']
            }
        }
    });
});
