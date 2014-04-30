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
        collectionTemplate =
            '<ul class="u-unstyled l-row l-row--items-3 collection collection--linkslist-and-mpu">' +
                '<li class="l-row__item l-row__item--boost-2 collection__item">{{collection}}</li>' +
                '<li class="l-row__item l-row__item--mpu">{{adSlot}}</li>' +
            '</ul>';

    function CollectionAdverts(config) {
        this.config = _assign(this.defaultConfig, config);
    }

    CollectionAdverts.prototype.defaultConfig = {
        containerSelector: '.container',
        selector: '.collection-wrapper--ad'
    };

    CollectionAdverts.prototype.init = function() {
        if (!this.config.switches.standardAdverts) {
            return false;
        }
        // filter out hidden containers
        var adCollections = $(this.config.containerSelector)
            .map(function(container) { return $(container); })
            .filter(function($container) {
                return qwery(this.config.selector, $container[0]).length && $container.css('display') !== 'none';
            }, this)
            .map(function($container) {
                return $(this.config.selector, $container[0]).first();
            }, this)
            .slice(0, adNames.length);

        adCollections.forEach(function($collection, index) {
            $collection
                .removeClass('linkslist-container')
                .addClass('collection-wrapper collection-wrapper--position-2')
                .html(
                    collectionTemplate
                        .replace('{{collection}}', $collection.html())
                        .replace('{{adSlot}}', adSlotTemplate.replace(/{{name}}/g, adNames[index]))
                );
        });

        return adCollections;
    };

    return CollectionAdverts;

});
