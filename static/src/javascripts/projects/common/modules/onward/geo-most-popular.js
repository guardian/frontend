/*
 Module: geo-most-popular.js
 Description: Shows popular trails for a given country.
 */
define([
    'Promise',
    'qwery',
    'lodash/functions/once',
    'common/modules/component',
    'common/utils/mediator'
], function (
    Promise,
    qwery,
    once,
    Component,
    mediator
) {

    var promise = new Promise(function (resolve, reject) {
        mediator.on('modules:onward:geo-most-popular:ready', resolve);
        mediator.on('modules:onward:geo-most-popular:error', reject);
    });

    function GeoMostPopular() {
        mediator.emit('register:begin', 'geo-most-popular');
    }

    Component.define(GeoMostPopular);

    GeoMostPopular.prototype.endpoint = '/most-read-geo.json';

    GeoMostPopular.prototype.ready = function () {
        mediator.emit('register:end', 'geo-most-popular');
        mediator.emit('modules:onward:geo-most-popular:ready', this);
    };

    GeoMostPopular.prototype.error = function (error) {
        mediator.emit('modules:onward:geo-most-popular:error', error);
    };

    return {

        render: once(function () {
            new GeoMostPopular().fetch(qwery('.js-components-container'), 'rightHtml');
            return promise;
        }),

        whenRendered: promise

    };

});
