/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
define([
    'qwery',
    'common/utils/ajax',
    'lodash/objects/assign',
    'common/modules/component',
    'common/modules/analytics/register'
], function (
    qwery,
    ajax,
    extend,
    Component,
    register
    ) {

    function GeoMostPopular(mediator, config) {
        register.begin('geo-most-popular');
        this.config = extend(this.config, config);
        this.mediator = mediator;
        this.fetch(qwery('.mpu-context'), 'rightHtml');
    }

    Component.define(GeoMostPopular);

    GeoMostPopular.prototype.endpoint = 'http://api.nextgen.guardianapps.co.uk/most-read-geo.json';

    GeoMostPopular.prototype.ready = function() {
        register.end('geo-most-popular');
    };



    return GeoMostPopular;

});