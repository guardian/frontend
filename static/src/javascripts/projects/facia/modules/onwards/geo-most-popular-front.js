// @flow
/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
 */
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import { begin, end } from 'common/modules/analytics/register';
import { Component } from 'common/modules/component';
import type bonzo from 'bonzo';

const hideTabs = (parent: bonzo): void => {
    $('.js-tabs-content', parent).addClass('tabs__content--no-border');
    $('.js-tabs', parent).addClass('u-h');
};

export class GeoMostPopularFront extends Component {
    constructor() {
        super();
        begin('most-popular');
        this.endpoint = '/most-read-geo.json';
        this.isNetworkFront =
            config.get('page.contentType') === 'Network Front';
        this.isVideoFront = config.get('page.pageId') === 'video';
        this.isInternational = config.get('page.pageId') === 'international';
        this.manipulationType = 'html';
    }

    isNetworkFront: boolean;
    isVideoFront: boolean;
    isInternational: boolean;
    parent: ?bonzo;

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
                const tab = this.parent.querySelector(tabSelector);

                if (tab) {
                    this.fetch(tab, 'html');
                }
            }
        }
    }

    ready(): void {
        if (this.isNetworkFront) {
            hideTabs(this.parent);
        }
        end('most-popular');
        mediator.emit('modules:geomostpopular:ready');
    }
}
