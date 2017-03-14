define([
    // The following modules are here for bundling purposes only.
    // We add this to enhanced/main, and subtract enhanced/main from other enhanced bootstraps to reduce module redundancy.

    // utilities
    'lib/$',
    'lib/ajax',
    'lib/config',
    'lib/cookies',
    'lib/detect',
    'lib/mediator',
    'lib/robust',
    'lib/storage',
    'lodash/utilities/template',
    'lib/url',
    'lib/fastdom-errors',

    // shared modules
    'common/modules/analytics/beacon',
    'common/modules/article/spacefinder',
    'common/modules/article/space-filler',
    'commercial/modules/build-page-targeting',
    'commercial/modules/dfp/create-slot',
    'commercial/modules/commercial-features',
    'commercial/modules/user-ad-targeting',
    'common/modules/component',
    'common/modules/experiments/ab',
    'common/modules/lazyload',
    'common/modules/ui/images',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'common/modules/ui/rhc',
    'common/modules/user-prefs',
    'common/views/svgs'
], function () {});
