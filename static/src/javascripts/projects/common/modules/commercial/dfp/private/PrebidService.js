/* global pbjs */
define([
    'Promise',
    'common/modules/commercial/ad-sizes',
    'common/utils/QueueAsync',
    'common/utils/config',
    'common/utils/robust',
    'lodash/arrays/uniq',
    'lodash/objects/values'
], function (
    Promise,
    adSizes,
    QueueAsync,
    config,
    robust,
    uniq,
    values
) {
    var PREBID_TIMEOUT = 2000;
    var supportedAdvertSizes = [
        adSizes.leaderboard,
        adSizes.mpu,
        adSizes.halfPage,
        adSizes.billboard
    ];

    return function PrebidService() {
        // We create a stub interface to use while Prebid.js is loading, passing commands it will run when it
        // finally arrives, before it replaces the stub with itself.
        window.pbjs = {que: []};
        require(['js!prebid.js']);

        window.pbjs.que.push(setDFPTargeting, enableAnalytics);

        // Prebid.js can only run one auction at a time. We only tender one
        // advert per auction to prevent network congestion. Each advert can
        // require multiple concurrent HTTP requests to different domains, and
        // there are surprisingly low ceilings how many some browsers support.
        var advertQueue = new QueueAsync(logError);

        // This allows us to re-use ad units on refresh
        var adUnits = {};

        this.loadAdvert = function loadAdvert(advert) {
            return advertQueue.add(function () {
                return runAuction(advert);
            });
        };

        function runAuction(advert) {
            var adSlotId = advert.id;
            var isNewAdvert = !adUnits[adSlotId];
            adUnits[adSlotId] =  adUnits[adSlotId] || new PrebidAdUnit(advert);

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

    function PrebidAdUnit(advert) {
        this.code = advert.id;
        this.sizes = getMatchingSizes(advert);
        this.bids = [{
            bidder : 'rubicon',
            params : {
                accountId : 11702,
                siteId : 37668,
                zoneId : 157046,
                visitor : {geo : 'us'},
                // Lets us target advert inventory
                inventory : {
                    section : config.page.section
                },
                // Lets us report on targeting
                keyword : config.page.section
            }
        }];
    }

    function getMatchingSizes(advert) {
        var advertSizes = concatAll(values(advert.sizes));

        return advertSizes.filter(function (size) {
            return supportedAdvertSizes.some(sizesMatch.bind(undefined, size));
        });

        function concatAll(arrays) {
            return Array.prototype.concat.apply([], arrays);
        }

        function sizesMatch(a, b) {
            // Compare by value rather than referential equality
            return a.toString() === b.toString();
        }
    }

    function setDFPTargeting() {
        pbjs.bidderSettings = {
            standard : {
                alwaysUseBid : false,
                adserverTargeting : [{
                    key : 'hb_pb',
                    val : getBidCpm
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

    function getBidCpm(bidResponse) {
        var cpm = parseFloat(bidResponse.cpm);
        var bucket;

        if (cpm >= 20.00) {
            bucket = 20;
        } else if (cpm >= 10.00) {
            bucket = priceToNearestBucket(cpm, 1.00);
        } else if (cpm >= 5.00) {
            bucket = priceToNearestBucket(cpm, 0.50);
        } else if (cpm >= 1.00) {
            bucket = priceToNearestBucket(cpm, 0.10);
        } else {
            bucket = priceToNearestBucket(cpm, 0.05);
        }

        return bucket.toFixed(2);
    }

    function priceToNearestBucket(price, bucket) {
        // Work in minor units (cents, pence) to avoid float manipulation
        price = price * 100;
        bucket = bucket * 100;

        var bucketCount = Math.floor(price / bucket);
        var bucketValue = bucketCount * bucket;

        return bucketValue / 100;
    }

    function enableAnalytics() {
        if (config.switches.googleAnalytics) {
            pbjs.enableAnalytics({
                provider: 'ga',
                options: {
                    global: 'ga',
                    trackerName: 'headerBiddingPropertyTracker',
                    enableDistribution: false
                }
            });
        }
    }

    function logError(e) {
        robust.log('cm-prebid', e);
    }

});
