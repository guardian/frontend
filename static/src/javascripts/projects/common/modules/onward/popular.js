define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/modules/component',
    'common/utils/mediator',
    'common/modules/commercial/dfp'
], function (
    qwery,
    $,
    config,
    Component,
    mediator,
    dfp
) {

    function MostPopular() {
        mediator.emit('register:begin', 'popular-in-section');
        this.hasSection = config.page && config.page.section && config.page.section !== 'global';
        this.endpoint = '/most-read' + (this.hasSection ? '/' + config.page.section : '') + '.json';
    }

    Component.define(MostPopular);

    MostPopular.prototype.init = function () {
        this.fetch(qwery('.js-popular-trails'), 'html');
    };

    MostPopular.prototype.prerender = function () {
        this.$mpu = $('.js-facia-slice__item--mpu', this.elem);
        this.$mpu.attr('id', 'inline-3')
                    .attr('data-name', 'inline-3')
                    .attr('data-label', 'true')
                    .attr('data-mobile', '300,250')
                    .html('<div class="ad-container"></div>');
    };

    MostPopular.prototype.ready = function () {
        dfp.addSlot(this.$mpu);
        this.$mpu.removeClass('facia-slice__item--no-mpu');
        mediator.emit('modules:popular:loaded', this.elem);
        mediator.emit('register:end', 'popular-in-section');
    };

    return MostPopular;
});
