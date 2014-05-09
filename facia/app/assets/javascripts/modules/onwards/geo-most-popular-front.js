/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
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

    function GeoMostPopularFront(mediator, config) {
        register.begin('most-popular');
        this.config = extend(this.config, config);
        this.mediator = mediator;
        this.manipulationType = 'html';

        /*jshint unused:false*/
        function go() {
           var parent = qwery('.js-popular-trails')[0];
            if (parent) {
                this.fetch(parent, 'html');
            }
        }
    }

    Component.define(GeoMostPopularFront);

    // Geo is only available via the CDN, hence hardcoded url
    GeoMostPopularFront.prototype.endpoint = 'http://api.nextgen.guardianapps.co.uk/most-read-geo.json';

    GeoMostPopularFront.prototype.ready = function() {
        register.end('most-popular');
    };

    return GeoMostPopularFront;

});
