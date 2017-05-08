// @flow
/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
 */
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import register from 'common/modules/analytics/register';
import Component from 'common/modules/component';

const hideTabs = (parent: Element): void => {
    $('.js-tabs-content', parent).addClass('tabs__content--no-border');
    $('.js-tabs', parent).addClass('u-h');
};

// #? Review use of inheritance
export class GeoMostPopularFront extends Component {
    constructor() {
        super();
        register.begin('most-popular');
    }

    prerender(): void {
        this.elem = qwery('.headline-list', this.elem)[0];
    }

    go(): void {
        const tabSelector = this.isNetworkFront ? '.js-tab-1' : '.js-tab-2';
        this.parent = qwery('.js-popular-trails')[0];

        if (this.parent) {
            if (
                (this.isInternational && this.isNetworkFront) ||
                this.isVideoFront
            ) {
                // hide the tabs
                hideTabs(this.parent);
            } else {
                this.tab = qwery(tabSelector, this.parent)[0];
                this.fetch(this.tab, 'html');
            }
        }
    }

    ready(): void {
        if (this.isNetworkFront) {
            hideTabs(this.parent);
        }
        register.end('most-popular');
        mediator.emit('modules:geomostpopular:ready');
    }
}

Component.define(GeoMostPopularFront);

GeoMostPopularFront.prototype.endpoint = '/most-read-geo.json';
GeoMostPopularFront.prototype.isNetworkFront =
    config.page.contentType === 'Network Front';
GeoMostPopularFront.prototype.isVideoFront = config.page.pageId === 'video';
GeoMostPopularFront.prototype.isInternational =
    config.page.pageId === 'international';
GeoMostPopularFront.prototype.manipulationType = 'html';
