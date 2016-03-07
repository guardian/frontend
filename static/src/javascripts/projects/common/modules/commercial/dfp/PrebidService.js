/* global pbjs */
define([
    'Promise',
    'common/modules/commercial/dfp/QueueAsync',
    'common/utils/config',
    'common/utils/robust',
    'lodash/arrays/uniq',
    'lodash/objects/values'
], function (
    Promise,
    QueueAsync,
    config,
    robust,
    uniq,
    values
) {
    var PREBID_TIMEOUT = 2000;

    return function PrebidService(pageTargeting) {
        // We create a stub interface to use while Prebid.js is loading, passing commands it will run when it
        // finally arrives, before it replaces the stub with itself.
        window.pbjs = {que: []};
        require(['js!prebid.js']);

        window.pbjs.que.push(setDFPTargeting);

        // Prebid.js can only run one auction at a time. We only tender one
        // advert per auction to prevent network congestion. Each advert can
        // require multiple concurrent HTTP requests to different domains, and
        // there are surprisingly low ceilings how many some browsers support.
        var advertQueue = new QueueAsync(logError);

        // This allows us to re-use ad units on refresh
        var adUnits = {};

        var targetingKeywords = pageTargeting.k.toString();

        this.loadAdvert = function loadAdvert(advert) {
            return advertQueue.add(function () {
                runAuction(advert);
            });
        };

        function runAuction(advert) {
            var adSlotId = advert.adSlotId;
            var isNewAdvert = !adUnits[adSlotId];
            adUnits[adSlotId] =  adUnits[adSlotId] || new PrebidAdUnit(advert, targetingKeywords);

            return new Promise(function (resolve, reject) {
                pbjs.que.push(function () {
                    if (isNewAdvert) {
                        pbjs.addAdUnits([adUnits[adSlotId]]);
                    }
                    pbjs.requestBids({
                        timeout : PREBID_TIMEOUT,
                        adUnits : [adUnits[adSlotId]],
                        bidsBackHandler : function () {
                            try {
                                pbjs.setTargetingForGPTAsync([adSlotId]);
                                window.googletag.display(adSlotId);
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        }
                    });
                });
            });
        }
    };

    function PrebidAdUnit(advert, targetingKeywords) {
        this.code = advert.adSlotId;
        this.sizes = getAllValidSlotSizes(advert);
        this.bids = [{
            bidder : 'rubicon',
            params : {
                accountId : 11702,
                siteId : 37668,
                zoneId : 157046,
                visitor : {geo : 'us'},
                keywords : targetingKeywords
            }
        }];
    }

    function getAllValidSlotSizes(advert) {
        var sizesForAllBreakpoints = concatAll(values(advert.sizes));
        return uniq(sizesForAllBreakpoints, arrayValue);

        function concatAll(arrays) {
            return Array.prototype.concat.apply([], arrays);
        }

        function arrayValue(array) {
            // Gets array value to test non-referential equality
            return array.toString();
        }
    }

    function setDFPTargeting() {
        pbjs.bidderSettings = {
            standard : {
                alwaysUseBid : false,
                adserverTargeting : [{
                    key : 'hb_pb',
                    val : cpmToPriceBucket
                }, {
                    key : 'hb_adid',
                    val : function getBidAdId(bidResponse) {
                        return bidResponse.adId;
                    }
                }, {
                    key : 'hb_bidder',
                    val : function getBidder(bidResponse) {
                        return bidResponse.bidder;
                    }
                }]
            }
        };
    }

    function cpmToPriceBucket(bidResponse) {
        var cpm = parseFloat(bidResponse.cpm);

        if (cpm >= 20.00) {
            return '20.00';
        } else if (cpm >= 5.00) {
            return bidResponse.pbLg; // .50 increments
        } else if (cpm >= 1.00) {
            return bidResponse.pbMg; // .10 increments
        } else {
            return toFiveCentBucket(cpm).toString();
        }

        function toFiveCentBucket(dollars) {
            // Use cents to avoid float manipulation
            var cents = dollars * 100;
            var fiveCents = Math.floor(cents / 5);
            return (fiveCents * 5) / 100;
        }
    }

    function logError(e) {
        robust.log('cm-prebid', e);
    }

});
