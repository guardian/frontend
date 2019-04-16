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
        if (config.get('switches.extendedMostPopular')) {
            /**
             * mostReadClone is a clone of the server side rendered most read element.
             * After making the clone we hydrate it with the latestMostPopularTab and the
             * latestMostCards, which are retrieved from the element in the network response (aka this.elem).
             * The server side rendered most read element will be replaced with the hydrated mostReadClone.
             */
            if (this.parent) {
                const mostReadClone = this.parent.cloneNode(true);
                const latestMostPopularTab = qwery(
                    '.most-popular',
                    this.elem
                )[0];
                /**
                 * Find the 2nd tab in mostReadClone and assign to mostPopularTabInClone.
                 * This tab is initially empty, so we want to hydrate/replace it with the latestMostPopularTab.
                 */
                const mostPopularTabInClone = qwery(
                    '.js-tab-2 .most-popular',
                    mostReadClone
                )[0];

                if (
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
                const mostCardsInClone = qwery(
                    mostCardsSelector,
                    mostReadClone
                )[0];

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

                /**
                 * Setting this.elem to be mostReadClone means
                 * mostReadClone will replace the existing server side rendered
                 * most read element.
                 */
                this.elem = mostReadClone;
            }
        } else {
            this.elem = qwery('.headline-list', this.elem)[0];
        }
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
            } else if (
                config.get('switches.extendedMostPopular') &&
                this.parent
            ) {
                /**
                 * if extendedMostPopular switch is enabled we will replace the
                 * entire server side most read element.
                 */
                this.fetch(this.parent, 'html');
            } else if (this.parent) {
                /**
                 * if extendedMostPopular switch is enabled we will replace the
                 * entire server side most read element.
                 */
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

// import qwery from 'qwery';
// import $ from 'lib/$';
// import config from 'lib/config';
// import mediator from 'lib/mediator';
// import { begin, end } from 'common/modules/analytics/register';
// import { Component } from 'common/modules/component';
// import type bonzo from 'bonzo';

// const hideTabs = (parent: bonzo): void => {
//     $('.js-tabs-content', parent).addClass('tabs__content--no-border');
//     $('.js-tabs', parent).addClass('u-h');
// };

// export class GeoMostPopularFront extends Component {
//     constructor() {
//         super();
//         begin('most-popular');
//         this.isNetworkFront =
//             config.get('page.contentType') === 'Network Front';

//         // These two sections do not have their own most popular endpoints
//         const sectionsWithoutPopular = ['info', 'global'];
//         const pageSection = config.get('page.section');
//         const hasPopularInSection =
//             pageSection && !sectionsWithoutPopular.includes(pageSection);

//         this.getExtendedMostPopularInSection =
//             !this.isNetworkFront &&
//             hasPopularInSection &&
//             config.get('switches.extendedMostPopular');

//         /**
//          * Use the extended most popular in section endpoint
//          * for section fronts when the extendedMostPopular switch
//          * is on.
//          */
//         if (this.getExtendedMostPopularInSection) {
//             this.endpoint = `/most-read/front/${pageSection}.json`;
//         } else {
//             this.endpoint = '/most-read-geo.json';
//         }

//         this.isVideoFront = config.get('page.pageId') === 'video';
//         this.isInternational = config.get('page.pageId') === 'international';
//         this.manipulationType = 'html';
//     }

//     getExtendedMostPopularInSection: boolean;
//     isNetworkFront: boolean;
//     isVideoFront: boolean;
//     isInternational: boolean;
//     parent: ?bonzo;

//     prerender(): void {
//         if (!config.get('switches.extendedMostPopular')) {
//             this.elem = qwery('.headline-list', this.elem)[0];
//         }
//     }

//     go(): void {
//         const tabSelector = this.isNetworkFront ? '.js-tab-1' : '.js-tab-2';
//         this.parent = qwery('.js-popular-trails')[0];

//         if (this.parent) {
//             if (this.getExtendedMostPopularInSection) {
//                 /**
//                  * Only go into this block on section fronts when
//                  * extendedMostPopular switch is on. this removes general
//                  * most popular trails and replaces with the
//                  * extended most popular trails.
//                  */
//                 this.parent.innerHTML = '';
//                 this.fetch(this.parent, 'html');
//             } else {
//                 /**
//                  * We'll only go into this block for Network fronts
//                  * or sections fronts when extendedMostPopular switch is off.
//                  */
//                 const tab = this.parent.querySelector(tabSelector);

//                 if (tab) {
//                     this.fetch(tab, 'html');
//                 }
//             }
//         }
//     }

//     ready(): void {
//         if (this.isNetworkFront || this.isVideoFront) {
//             hideTabs(this.parent);
//         }
//         end('most-popular');
//         mediator.emit('modules:geomostpopular:ready');
//     }
// }
