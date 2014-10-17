/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
define([
    'qwery',
    'lodash/objects/assign',
    'common/modules/component',
    'common/utils/mediator'
], function (
    qwery,
    extend,
    Component,
    mediator
) {

    function GeoMostPopular(config) {
        mediator.emit('register:begin', 'geo-most-popular');
        this.config = extend(this.config, config);
        this.fetch(qwery('.js-components-container'), 'rightHtml');
    }

    Component.define(GeoMostPopular);

    GeoMostPopular.prototype.endpoint = '/most-read-geo.json';

    GeoMostPopular.prototype.ready = function () {
        mediator.emit('register:end', 'geo-most-popular');
    };

    return GeoMostPopular;
});
