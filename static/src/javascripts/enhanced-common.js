define([
    // The following modules are here for bundling purposes only.
    // We add this to enhanced/main, and subtract enhanced/main from other enhanced bootstraps to reduce module redundancy.

    // utilities
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/url',
    'common/utils/fastdom-errors',

    // shared modules
    'common/modules/analytics/beacon',
    'common/modules/article/spacefinder',
    'common/modules/article/space-filler',
    'commercial/modules/build-page-targeting',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/component',
    'common/modules/analytics/omniture',
    'common/modules/experiments/ab',
    'common/modules/lazyload',
    'common/modules/ui/images',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/ui/rhc',
    'common/modules/user-prefs',
    'common/views/svgs'
], function () {});
