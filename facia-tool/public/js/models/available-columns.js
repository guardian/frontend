export default {
    'frontsTrail': {
        title: 'Front',
        layoutType: 'front',
        widget: 'fronts-widget'
    },
    'frontsTreats': {
        title: 'Treats',
        layoutType: 'treats',
        widget: 'fronts-widget',
        params: {
            mode: 'treats'
        },
        selectable: false
    },
    'latestTrail': {
        title: 'Latest',
        layoutType: 'latest',
        widget: 'latest-widget'
    },
    'clipboardTrail': {
        title: 'Clipboard',
        layoutType: 'clipboard',
        widget: 'fronts-standalone-clipboard'
    },
    'frontsConfig': {
        title: 'Fronts',
        layoutType: 'config',
        widget: 'fronts-config-widget'
    }
};
