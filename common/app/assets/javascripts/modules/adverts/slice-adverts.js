define([
    'common/$',
    'bonzo',
    'qwery',
    'lodash/objects/assign',
    'common/utils/template'
], function (
    $,
    bonzo,
    qwery,
    _assign,
    template
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
        sliceSelector: '.facia-slice-wrapper--ad'
    };

    SliceAdverts.prototype.init = function() {
        if (!this.config.switches.standardAdverts) {
            return false;
        }
        // get all the containers
        var containers = qwery(this.config.containerSelector),
            index = 0,
            adSlices = [],
            containerGap = 2;
        // pull out ad slices which are have at least x containers between them
        while (index <= containers.length) {
            var $adSlice = $(this.config.sliceSelector, containers[index]);
            if ($adSlice.length) {
                adSlices.push($adSlice.first());
                index += (containerGap + 1);
            } else {
                index++;
            }
        }

        adSlices.slice(0, adNames.length).forEach(function($originalSlice, index) {
            $originalSlice
                .removeClass('linkslist-container')
                .addClass('facia-slice-wrapper facia-slice-wrapper--position-2')
                .html(
                    template(newSliceTemplate, {
                        linkslist: $originalSlice.html(),
                        adSlot: template(adSlotTemplate, { name: adNames[index] })
                    })
                );
        });

        return adSlices;
    };

    return SliceAdverts;

});
