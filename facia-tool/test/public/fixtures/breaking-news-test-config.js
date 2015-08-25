export default {
    config: {
        fronts: {
            'breaking-news': {
                collections: ['global', 'uk-alerts'],
                description: 'New News',
                title: 'Breaking news'
            }
        },
        collections: {
            'global': {
                displayName: 'Global alerts',
                groups: ['minor', 'major'],
                type: 'breaking-news/not-for-other-fronts'
            },
            'uk-alerts': {
                displayName: 'UK alerts',
                groups: ['minor', 'major'],
                type: 'breaking-news/not-for-other-fronts'
            }
        }
    },
    switches: {
        'facia-tool-disable': false,
        'facia-tool-draft-content': true,
        'facia-tool-sparklines': false
    },
    defaults: {
        env: 'prod',
        editions: ['uk'],
        navSections: ['news'],
        email: 'alerts@theguardian.com',
        avatarUrl: '',
        lowFrequency: 60,
        highFrequency: 2,
        standardFrequency: 5,
        fixedContainers: [{ 'name':'fixed/test' }],
        dynamicContainers: [{ 'name':'dynamic/test' }]
    }
};
