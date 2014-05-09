/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
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

    function GeoMostPopularFront(mediator, config) {
        register.begin('most-popular');
        this.config = extend(this.config, config);
        this.mediator = mediator;
        this.manipulationType = 'html';
        this.fetch(qwery('.js-popular-trails'), 'html');
    }

    Component.define(GeoMostPopularFront);

    GeoMostPopularFront.prototype.endpoint = 'http://api.nextgen.guardianapps.co.uk/most-read-geo.json';

    GeoMostPopularFront.prototype.ready = function() {
        register.end('most-popular');
    };

    return GeoMostPopularFront;

});
