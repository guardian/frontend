define([
    'common/$',
    'bonzo',
    'qwery',
    'lodash/objects/defaults',
    'common/utils/template',
    'common/modules/adverts/dfp'
], function (
    $,
    bonzo,
    qwery,
    defaults,
    template,
    dfp
) {

    var adNames = ['inline1', 'inline2'];

    function SliceAdverts(c) {

        this.config = defaults(c || {}, {
            containerSelector: '.container',
            sliceSelector: '.js-slice--ad-candidate',
            page: {},
            switches: {}
        });
    }

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
        while (index < containers.length) {
            var $adSlice = $(this.config.sliceSelector, containers[index]),
                // don't display ad in the first container on the fronts
                isFrontFirst = ['uk', 'us', 'au'].indexOf(this.config.page.pageId) > -1 && index === 0;
            if ($adSlice.length && !isFrontFirst) {
                adSlices.push($adSlice.first());
                index += (containerGap + 1);
            } else {
                index++;
            }
        }

        adSlices.slice(0, adNames.length).forEach(function($adSlice, index) {
            $adSlice
                .addClass('slice--has-ad')
                .append(dfp.createAdSlot(adNames[index], 'container-inline'));
        });

        return adSlices;
    };

    return SliceAdverts;

});
