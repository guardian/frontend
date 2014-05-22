define([
    'common/$',
    'bonzo',
    'qwery',
    'lodash/objects/assign',
    'common/utils/template',
    'common/modules/adverts/dfp'
], function (
    $,
    bonzo,
    qwery,
    _assign,
    template,
    dfp
) {

    var adNames = ['inline1', 'inline2'];

    function SliceAdverts(config) {
        this.config = _assign(this.defaultConfig, config);
    }

    SliceAdverts.prototype.defaultConfig = {
        containerSelector: '.container',
        sliceSelector: '.slice--ad-candidate'
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
        while (index < containers.length) {
            var $adSlice = $(this.config.sliceSelector, containers[index]);
            if ($adSlice.length) {
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
