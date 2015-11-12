define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/component',
    'common/utils/mediator',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp-api',
    'common/modules/experiments/ab',
    'common/modules/onward/inject-container',
    'lodash/collections/contains'
], function (
    qwery,
    $,
    config,
    detect,
    Component,
    mediator,
    createAdSlot,
    commercialFeatures,
    dfp,
    ab,
    injectContainer,
    contains) {

    function MostPopular() {
        // This is not going to evolve into a random list of sections. If anyone wants more than these 2 then
        // they get to comission the work to have it go through the entire tooling chain so that a section has a
        // property that tells us whether it shows most popular or not.
        // Don't even come ask...
        var sectionsWithoutPopular = ['info', 'global'];
        mediator.emit('register:begin', 'popular-in-section');
        this.hasSection = config.page && config.page.section && !contains(sectionsWithoutPopular, config.page.section);

        if (ab.getParticipations().MostPopularDefaultTest &&
            ab.getParticipations().MostPopularDefaultTest.variant === 'variant' &&
            ab.testCanBeRun('MostPopularDefaultTest')) {

            this.endpoint = '/ab-most-read' + (this.hasSection ? '/' + config.page.section : '') + '.json';
        } else {
            this.endpoint = '/most-read' + (this.hasSection ? '/' + config.page.section : '') + '.json';
        }
    }

    Component.define(MostPopular);

    MostPopular.prototype.init = function () {
        if (ab.getParticipations().InjectNetworkFrontTest && ab.getParticipations().InjectNetworkFrontTest.variant === 'variant' && ab.testCanBeRun('InjectNetworkFrontTest')) {
            var frontUrl;

            switch (config.page.edition) {
                case 'UK':
                    frontUrl = '/uk.json';
                    break;
                case 'US':
                    frontUrl = '/us.json';
                    break;
                case 'AU':
                    frontUrl = '/au.json';
                    break;
                case 'INT':
                    frontUrl = '/international.json';
                    break;
            }

            injectContainer.injectContainer(frontUrl, '.js-most-popular-footer', 'ab-network-front-loaded');

            mediator.once('ab-network-front-loaded', function () {
                var $parent = $('.facia-page');
                $parent.addClass('ab-front-injected');
                $parent.attr('data-link-name', $parent.attr('data-link-name') + ' | ab-front-injected');
                $('.js-tabs-content', $parent).addClass('tabs__content--no-border');
                $('.js-tabs', $parent).addClass('u-h');

                this.prerender(true);
                this.ready();
            }.bind(this));
        } else {
            this.fetch(qwery('.js-popular-trails'), 'html');
        }
    };

    MostPopular.prototype.mobileMaximumSlotsReached = function () {
        return (detect.getBreakpoint() === 'mobile' && $('.ad-slot--inline').length > 1);
    };

    MostPopular.prototype.prerender = function (inInjectFrontTest) {
        if (commercialFeatures.popularContentMPU && !this.mobileMaximumSlotsReached()) {
            var $mpuEl = (inInjectFrontTest) ? $('#most-popular .js-fc-slice-mpu-candidate', this.elem) : $('.js-fc-slice-mpu-candidate', this.elem);
            this.$mpu = $mpuEl.append(createAdSlot('mostpop', 'container-inline'));
        } else {
            this.$mpu = undefined;
        }
    };

    MostPopular.prototype.ready = function () {
        if (this.$mpu) {
            dfp.addSlot($('.ad-slot', this.$mpu));
            this.$mpu.removeClass('fc-slice__item--no-mpu');
        }
        mediator.emit('modules:popular:loaded', this.elem);
        mediator.emit('page:new-content', this.elem);
        mediator.emit('register:end', 'popular-in-section');
    };

    return MostPopular;
});
