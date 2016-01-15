/* global googletag: false */
/* global pbjs: true */

define([
    'Promise',
    'bonzo',
    'common/modules/commercial/prebid-test/placements',
    'common/modules/experiments/ab',
    'common/utils/config',
    'common/utils/detect',
    'lodash/collections/filter',
    'lodash/collections/find',
    'lodash/collections/findLast',
    'lodash/collections/forEach',
    'lodash/collections/map'
], function (
    Promise,
    bonzo,
    placements,
    ab,
    config,
    detect,
    filter,
    find,
    findLast,
    forEach,
    map
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

        var pendingAdverts = new Promise.resolve(true);

        this.loadSlots = function (slotIds) {
            slotIds = Array.isArray(slotIds) ? slotIds : [slotIds];

            var pbjsAdUnits = map(slotIds, function (id) {
                return new PrebidAdUnit(id);
            });

            pendingAdverts = pendingAdverts.then(function loadNextSet() {
                console.log('Loading', JSON.stringify(slotIds));

                return new Promise(function (resolve) {
                    window.pbjs.que.push(function () {
                        pbjs.addAdUnits(pbjsAdUnits);
                        pbjs.requestBids({
                            bidsBackHandler : function () {
                                // We are not actually going to use the bid responses; this test purely validates performance
                                forEach(slotIds, googletag.display);
                                console.log('Showing', JSON.stringify(slotIds));
                                resolve();
                            }
                        });
                    });
                });
            });

            return pendingAdverts;
        };

    }

    function PrebidAdUnit(slotElementId) {
        this.code = slotElementId;

        this.sizes = getSlotAdSizes(slotElementId);
        //console.log('mapping', slotElementId, JSON.stringify(this.sizes));

        this.bids = getAppnexusBids(this.sizes);
        //console.log('mapping', slotElementId, JSON.stringify(this.bids));
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
                        return bidResponse.adId;
                    }
                }]
            }
        };
    }

    function getAppnexusBids(slotSizes) {
        var slotPlacements = placements;

        slotPlacements = filter(slotPlacements, function matchEdition(placement) {
            return placement.edition === config.page.edition;
        });

        slotPlacements = filter(slotPlacements, function matchViewport(placement) {
            return detect.isBreakpoint(placement.breakpoint);
        });

        slotPlacements = filter(slotPlacements, function matchSlotSize(placement) {
            return find(slotSizes, function (slotSize) {
                return slotSize[0] === placement.width && slotSize[1] === placement.height;
            });
        });

        return map(slotPlacements, function toPrebidPlacement(placement) {
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
        return map(sizeStrings, function (sizeString) {
            var dimensions = sizeString.split(',');
            return map(dimensions, function (widthOrHeightString) {
                return parseInt(widthOrHeightString, 10);
            });
        });
    }

    return new PrebidTestService();

});
