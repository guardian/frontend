define([
    'common/$',
    'bonzo',
    'qwery',
    'lodash/objects/assign'
], function (
    $,
    bonzo,
    qwery,
    _assign
) {

    var adNames = ['inline1', 'inline2'],
        adSlotTemplate =
            '<div class="ad-slot ad-slot--dfp ad-slot--container-inline" data-link-name="ad slot {{name}}" data-name="{{name}}" data-mobile="300,50" data-mobilelandscape="300,50|320,50" data-tabletportrait="300,250">' +
                '<div id="dfp-ad--{{name}}" class="ad-slot__container">' +
            '</div>',
        newSliceTemplate =
            '<ul class="u-unstyled l-row l-row--items-3 facia-slice facia-slice--linkslist-and-mpu">' +
                '<li class="l-row__item l-row__item--boost-2 facia-slice__item">{{linkslist}}</li>' +
                '<li class="l-row__item l-row__item--mpu">{{adSlot}}</li>' +
            '</ul>';

    function SliceAdverts(config) {
        this.config = _assign(this.defaultConfig, config);
    }

    SliceAdverts.prototype.defaultConfig = {
        containerSelector: '.container',
        selector: '.facia-slice-wrapper--ad'
    };

    SliceAdverts.prototype.init = function() {
        if (!this.config.switches.standardAdverts) {
            return false;
        }
        // filter out hidden containers
        var adSlices = $(this.config.containerSelector)
            .map(function(container) { return $(container); })
            .filter(function($container) {
                return qwery(this.config.selector, $container[0]).length && $container.css('display') !== 'none';
            }, this)
            .map(function($container) {
                return $(this.config.selector, $container[0]).first();
            }, this)
            .slice(0, adNames.length);

        adSlices.forEach(function($originalSlice, index) {
            $originalSlice
                .removeClass('linkslist-container')
                .addClass('facia-slice-wrapper facia-slice-wrapper--position-2')
                .html(
                    newSliceTemplate
                        .replace('{{linkslist}}', $originalSlice.html())
                        .replace('{{adSlot}}', adSlotTemplate.replace(/{{name}}/g, adNames[index]))
                );
        });

        return adSlices;
    };

    return SliceAdverts;

});
