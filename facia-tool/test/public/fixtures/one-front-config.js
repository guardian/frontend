define([
    'mock-config'
], function (
    mockConfig
) {
    mockConfig.set({
        fronts: {
            uk: {
                collections: ['latest'],
                description: 'Broken news',
                title: 'UK',
                priority: 'test'
            }
        },
        collections: {
            'latest': {
                displayName: 'politics'
            }
        }
    });
});
