/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
define([
    'qwery',
    'lodash/objects/assign',
    'common/modules/component',
    'common/modules/analytics/register'
], function (
    qwery,
    extend,
    Component,
    register
    ) {

    function GeoMostPopular(config) {
        register.begin('geo-most-popular');
        this.config = extend(this.config, config);
        this.fetch(qwery('.mpu-context'), 'rightHtml');
    }

    Component.define(GeoMostPopular);

    GeoMostPopular.prototype.endpoint = '/most-read-geo.json';

    GeoMostPopular.prototype.ready = function() {
        register.end('geo-most-popular');
    };

    return GeoMostPopular;
});