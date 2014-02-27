/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
define([
    'qwery',
    'common/utils/ajax',
    'lodash/objects/assign',
    'common/modules/component'
], function (
    qwery,
    ajax,
    extend,
    Component
    ) {

    function GeoMostPopular(mediator, config) {
        this.config = extend(this.config, config);
        this.mediator = mediator;
        this.fetch(qwery('.mpu-context'), 'rightHtml');
    }

    Component.define(GeoMostPopular);

    GeoMostPopular.prototype.endpoint = 'http://api.nextgen.guardianapps.co.uk/most-read-geo.json';

    return GeoMostPopular;

});