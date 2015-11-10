define([
    'common/utils/_',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/component',
    'common/utils/mediator',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp-api',
    'common/modules/experiments/ab'
], function (
    _,
    qwery,
    $,
    config,
    detect,
    Component,
    mediator,
    createAdSlot,
    commercialFeatures,
    dfp,
    ab
) {

    function MostPopular() {
        // This is not going to evolve into a random list of sections. If anyone wants more than these 2 then
        // they get to comission the work to have it go through the entire tooling chain so that a section has a
        // property that tells us whether it shows most popular or not.
        // Don't even come ask...
        var sectionsWithoutPopular = ['info', 'global'];
        mediator.emit('register:begin', 'popular-in-section');
        this.hasSection = config.page && config.page.section && !_.contains(sectionsWithoutPopular, config.page.section);
        this.endpoint = '/most-read' + (this.hasSection ? '/' + config.page.section : '') + '.json';
    }

    Component.define(MostPopular);

    MostPopular.prototype.init = function () {
        if (!(ab.getParticipations().InjectNetworkFrontTest && ab.getParticipations().InjectNetworkFrontTest.variant === 'variant' && ab.testCanBeRun('InjectNetworkFrontTest'))) {
            this.fetch(qwery('.js-popular-trails'), 'html');
        } else {
            $('.js-most-popular-footer').hide();
        }
    };

    MostPopular.prototype.mobileMaximumSlotsReached = function () {
        return (detect.getBreakpoint() === 'mobile' && $('.ad-slot--inline').length > 1);
    };

    MostPopular.prototype.prerender = function () {
        if (commercialFeatures.popularContentMPU && !this.mobileMaximumSlotsReached()) {
            var $mpuEl = $('.js-fc-slice-mpu-candidate', this.elem);
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
