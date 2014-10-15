/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
 */
define([
    'common/utils/$',
    'qwery',
    'lodash/objects/assign',
    'common/modules/component',
    'common/modules/analytics/register',
    'common/utils/mediator',
    'common/utils/config'
], function (
    $,
    qwery,
    extend,
    Component,
    register,
    mediator,
    config
    ) {

    function GeoMostPopularFront() {
        register.begin('most-popular');
        this.config = extend(this.config, config);
        this.mediator = mediator;
    }

    Component.define(GeoMostPopularFront);

    // Geo is only available via the CDN, hence hardcoded url
    GeoMostPopularFront.prototype.endpoint = '/most-read-geo.json';
    GeoMostPopularFront.prototype.isNetworkFront = config.page.contentType === 'Network Front';
    GeoMostPopularFront.prototype.manipulationType = 'html';

    GeoMostPopularFront.prototype.prerender = function() {
        this.elem = $('.headline-list', this.elem)[0];
    };

    GeoMostPopularFront.prototype.go = function () {
        var tab = (this.isNetworkFront) ? '.js-tab-1' : '.js-tab-2';
        this.parent = qwery('.js-popular-trails')[0];

        if (this.parent) {
            this.tab = $(tab, this.parent)[0];
            this.fetch(this.tab, 'html');
        }
    };

    GeoMostPopularFront.prototype.ready = function () {
        if(this.isNetworkFront) {
            $('.js-tabs-content', this.parent).addClass('tabs__content--no-border');
            $('.js-tabs', this.parent).addClass('u-h');
        }
        register.end('most-popular');
        this.mediator.emit('modules:geomostpopular:ready');
    };

    return GeoMostPopularFront;

});
