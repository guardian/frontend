require([
    // 3rd party libs
    'raven',
    'lodash/main',
    'picturefill',

    // utilities
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/url',

    // shared modules
    'common/modules/analytics/beacon',
    'common/modules/commercial/badges',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/component',
    'common/modules/experiments/ab',
    'common/modules/lazyload',
    'common/modules/ui/images',
    'common/modules/ui/tabs',
    'common/modules/user-prefs'
], function () {});
