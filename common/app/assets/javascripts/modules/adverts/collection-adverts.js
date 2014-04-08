define([
    'common/$',
    'common/common',
    'bonzo',
    'bean',
    'lodash/objects/assign'
], function (
    $,
    common,
    bonzo,
    bean,
    _assign
) {

    var $slots,
        adNames = ['inline1', 'inline2'],
        adSlotTemplate =
            '<div class="ad-slot ad-slot--dfp ad-slot--container-inline" data-link-name="ad slot {{name}}" data-name="{{name}}" data-mobile="300,50" data-tabletportrait="300,250">' +
                '<div id="dfp-ad--{{name}}" class="ad-slot__container">' +
            '</div>',
        collectionTemplate =
            '<ul class="u-unstyled l-row l-row--items-3 collection collection--linkslist-and-mpu">' +
                '<li class="l-row__item l-row__item--boost-2 collection__item">{{collection}}</li>' +
                '<li class="l-row__item l-row__item--mpu">{{adSlot}}</li>' +
            '</ul>';

    function CollectionAdverts(config) {
        this.config = _assign(this.defaultConfig, config);
    }

    CollectionAdverts.prototype.defaultConfig = {
        selector: '.collection-wrapper--ad'
    };

    CollectionAdverts.prototype.init = function() {
        if (!this.config.switches.standardAdverts) {
            return;
        }
        // get the potential ad slots
        $slots = $(this.config.selector)
            .map(function(slot) {
                return bonzo(slot);
            })
            .slice(0, adNames.length)
            .forEach(function($slot, index) {
                $slot.html(
                    collectionTemplate
                        .replace('{{collection}}', $slot.html())
                        .replace('{{adSlot}}', adSlotTemplate.replace(/{{name}}/g, adNames[index]))
                );
            });
    };

    return CollectionAdverts;

});
