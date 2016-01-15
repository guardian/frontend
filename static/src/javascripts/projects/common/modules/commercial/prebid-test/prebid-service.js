/* global googletag: false */
/* global pbjs: true */

define([
    'Promise',
    'bonzo',
    'common/modules/commercial/prebid-test/placements',
    'common/modules/experiments/ab',
    'common/utils/config',
    'common/utils/detect',
    'lodash/collections/find',
    'lodash/collections/findLast'
], function (
    Promise,
    bonzo,
    placements,
    ab,
    config,
    detect,
    find,
    findLast
) {
    function PrebidTestService() {
        window.pbjs = window.pbjs || {que : []};
        window.pbjs.que.push(setupPrebidTargeting);

        this.testEnabled = ab.isInVariant('PrebidPerformance', 'variant');

        this.loadDependencies = function () {
            require(['js!prebid.js']);
        };

        this.slotIsInTest = function (slot) {
            return ['dfp-ad--pageskin-inread', 'dfp-ad--merchandising-high'].indexOf(slot) === -1;
        };

        this.loadSlot = function (slotElementId) {
            return new Promise(function (resolve) {
                window.pbjs.que.push(function () {
                    pbjs.addAdUnits([new PrebidAdUnit(slotElementId)]);
                    pbjs.requestBids({bidsBackHandler : function (bids) {
                        if (config.page.isDev) {
                            logResponses(slotElementId, bids);
                        }
                        displayWinner();
                    }});

                    function displayWinner() {
                        pbjs.setTargetingForGPTAsync(slotElementId);
                        googletag.display(slotElementId);
                        resolve();
                    }
                });
            });
        };


    }

    function logResponses(slotElementId, bids) {
        for (var bid in bids) {
            if (bids.hasOwnProperty(bid)) {
                var values = bids[bid].bids.map(function(x) {
                    return [x.statusMessage, x.cpm, x.adUrl]
                });
                console.log(slotElementId, JSON.stringify(values));
            }
        }
    }

    function PrebidAdUnit(slotElementId) {
        this.code = slotElementId;

        this.sizes = getSlotAdSizes(slotElementId);
        console.log('mapping', slotElementId, JSON.stringify(this.sizes));

        this.bids = getAppnexusBids(this.sizes);
        console.log('mapping', slotElementId, JSON.stringify(this.bids));
    }

    function setupPrebidTargeting() {
        pbjs.bidderSettings = {
            standard : {
                alwaysUseBid : false,
                adserverTargeting : [{
                    key : 'hb_pb',
                    val : function () {
                        // Match key-value targeting for DFP prebid test line item
                        return '1.50';
                    }
                }, {
                    key : 'hb_adid',
                    val : function (bidResponse) {
                        return bidResponse.adId
                    }
                }]
            }
        };
    }

    function getAppnexusBids(slotSizes) {
        return placements
            .filter(function matchEdition(placement) {
                return placement.edition === config.page.edition;
            })
            .filter(function matchViewport(placement) {
                return detect.isBreakpoint(placement.breakpoint);
            })
            .filter(function matchSlotSize(placement) {
                return find(slotSizes, function(slotSize) {
                    return slotSize[0] === placement.width && slotSize[1] === placement.height;
                });
            })
            .map(function toPrebidPlacement(placement) {
                return {
                    bidder : 'appnexus',
                    params : {
                        placementId : placement.id,
                        referrer : 'http://www.theguardian.com/uk'
                    }
                };
            });
    }

    function getSlotAdSizes(slotElementId) {
        var $slot = bonzo(document.getElementById(slotElementId));

        var validBreakpoints = detect.breakpoints.filter(function (breakpoint) {
            return detect.isBreakpoint({min : breakpoint.name});
        });

        var validBreakpointKeys = validBreakpoints.map(function (breakpoint) {
            // Duplicated from dfp-api for the purpose of our test code
            return breakpoint.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        });

        var largestValidBreakpointDefinition = findLast(validBreakpointKeys, function (key) {
            return $slot.data(key) !== undefined;
        });

        var sizeMappingString = $slot.data(largestValidBreakpointDefinition);
        var sizeStrings = sizeMappingString.split('|');
        return sizeStrings.map(function (sizeString) {
            var dimensions = sizeString.split(',');
            return dimensions.map(function (widthOrHeightString) {
                return parseInt(widthOrHeightString, 10);
            });
        });
    }

    return new PrebidTestService();

});
