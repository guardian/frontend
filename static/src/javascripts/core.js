require([
    // 3rd party libs
    'raven',
    'lodash/main',
    'lodash/utilities/mixin',

    // utilities
    'common/utils/_',
    'common/utils/$',
    'common/utils/$css',
    'common/utils/ajax',
    'common/utils/atob',
    'common/utils/clamp',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/easing',
    'common/utils/get-property',
    'common/utils/mediator',
    'common/utils/page',
    'common/utils/request-animation-frame',
    'common/utils/scroller',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/time',
    'common/utils/to-array',
    'common/utils/url',
    'common/utils/userTiming',

    // shared modules
    'common/modules/commercial/badges',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/build-page-targeting',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/component',
    'common/modules/experiments/ab',
    'common/modules/lazyload',
    'common/modules/ui/images',
    'common/modules/ui/tabs',
    'common/modules/userPrefs'
], function () {});
