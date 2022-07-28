/*
 Module: geo-most-popular-front.js
 Description: replaces general most popular trails with geo based most popular on fronts.
 */
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import { mediator } from 'lib/mediator';
import { begin, end } from 'common/modules/analytics/register';
import { Component } from 'common/modules/component';

export class GeoMostPopularFrontExtended extends Component {
    constructor() {
        super();
        begin('most-popular');
        this.endpoint = '/most-read-geo.json';
        this.manipulationType = 'html';
    }



    prerender() {
        const isInternational = config.get('page.pageId') === 'international';

        /**
         * mostReadClone is a clone of the server side rendered most read element.
         * After making the clone we hydrate it with the latestMostPopularTab and the
         * latestMostCards, which are retrieved from the element in the network response (aka this.elem).
         * The server side rendered most read element will be replaced with the hydrated mostReadClone.
         */
        if (this.parent) {
            const mostReadClone = this.parent.cloneNode(true);
            const latestMostPopularTab = qwery('.most-popular', this.elem)[0];
            /**
             * Find the 2nd tab in mostReadClone and assign to mostPopularTabInClone.
             * This tab is initially empty, so we want to hydrate/replace it with the latestMostPopularTab.
             */
            const mostPopularTabInClone = qwery(
                '.js-tab-2 .most-popular',
                mostReadClone
            )[0];

            if (
                !isInternational && // we don't update the most popular list for international fronts
                latestMostPopularTab &&
                mostPopularTabInClone &&
                mostPopularTabInClone.parentNode
            ) {
                // Replace mostPopularTabInClone with latestMostPopularTab
                mostPopularTabInClone.parentNode.replaceChild(
                    latestMostPopularTab,
                    mostPopularTabInClone
                );
            }

            const mostCardsSelector = '.most-popular__second-tier';
            const latestMostCards = qwery(mostCardsSelector, this.elem)[0];
            /**
             * Find the most cards container in mostReadClone and assign to mostCardsInClone.
             * This container is initially empty, so we want to hydrate/replace it with the latestMostCards.
             */
            const mostCardsInClone = qwery(mostCardsSelector, mostReadClone)[0];

            if (
                latestMostCards &&
                mostCardsInClone &&
                mostCardsInClone.parentNode
            ) {
                // Replace mostCardsInClone with latestMostCards
                mostCardsInClone.parentNode.replaceChild(
                    latestMostCards,
                    mostCardsInClone
                );
            }

            const latestPopularTrails = qwery(
                '#popular-trails',
                mostReadClone
            )[0];

            if (latestPopularTrails) {
                /**
                 * Setting this.elem to be latestPopularTrails means
                 * latestPopularTrails will replace the contents of the existing
                 * server side rendered most read element.
                 */
                this.elem = latestPopularTrails;
            }
        }
    }

    go() {
        this.parent = qwery('.js-popular-trails')[0];

        if (this.parent) {
            this.fetch(this.parent, this.manipulationType);
        }
    }

    ready() {
        const isNetworkFront =
            config.get('page.contentType') === 'Network Front';

        // Hide tabs on all Network fronts
        if (isNetworkFront) {
            $('.js-tabs-content', this.parent).addClass(
                'tabs__content--no-border'
            );
            $('.js-tabs', this.parent).addClass('u-h');
        }

        end('most-popular');
        mediator.emit('modules:geomostpopular:ready');
    }
}
