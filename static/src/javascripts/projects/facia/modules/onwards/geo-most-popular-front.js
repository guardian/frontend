/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
 */
define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/analytics/register',
    'common/modules/component'
], function (
    qwery,
    $,
    config,
    mediator,
    register,
    Component
) {

    function GeoMostPopularFront() {
        register.begin('most-popular');
    }

    Component.define(GeoMostPopularFront);

    GeoMostPopularFront.prototype.endpoint = '/most-read-geo.json';
    GeoMostPopularFront.prototype.isNetworkFront = config.page.contentType === 'Network Front';
    GeoMostPopularFront.prototype.isVideoFront = config.page.pageId === 'video';
    GeoMostPopularFront.prototype.isInternational = config.page.pageId === 'international';
    GeoMostPopularFront.prototype.manipulationType = 'html';

    GeoMostPopularFront.prototype.prerender = function () {
        this.elem = qwery('.headline-list', this.elem)[0];
    };

    function hideTabs(parent) {
        $('.js-tabs-content', parent).addClass('tabs__content--no-border');
        $('.js-tabs', parent).addClass('u-h');
    }

    GeoMostPopularFront.prototype.go = function () {
        var tabSelector = (this.isNetworkFront) ? '.js-tab-1' : '.js-tab-2';
        this.parent = qwery('.js-popular-trails')[0];

        if (this.parent) {
            if ((this.isInternational && this.isNetworkFront) || this.isVideoFront) {
                // hide the tabs
                hideTabs(this.parent);
            } else {
                this.tab = qwery(tabSelector, this.parent)[0];
                this.fetch(this.tab, 'html');
            }
        }
    };

    GeoMostPopularFront.prototype.ready = function () {
        if (this.isNetworkFront) {
            hideTabs(this.parent);
        }
        register.end('most-popular');
        mediator.emit('modules:geomostpopular:ready');
    };

    return GeoMostPopularFront;

});
