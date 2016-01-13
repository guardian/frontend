/* global googletag: false */
/* global pbjs: true */

define([
    'Promise',
    'common/modules/experiments/ab'
], function (
    Promise,
    ab
) {
    return new PrebidTestService();

    function PrebidTestService() {
        var abTest = ab.getParticipations().PrebidPerformance;

        window.pbjs = window.pbjs || {que : []};
        window.pbjs.que.push(setupTargeting);

        this.testEnabled = abTest && abTest.variant === 'variant';

        this.loadDependencies = function () {
            require(['js!prebid.js']);
        };

        this.slotIsInTest = function (slot) {
            return ['dfp-ad--pageskin-inread', 'dfp-ad--merchandising-high'].indexOf(slot) === -1;
        };

        this.loadSlot = function (gptSlot, slotElementId) {
            return new Promise(function (resolve) {
                window.pbjs.que.push(function () {
                    pbjs.addAdUnits([new PrebidAdUnit(gptSlot, slotElementId)]);
                    pbjs.requestBids({bidsBackHandler : function (bids) {
                        console.log('Returned bids for', slotElementId, 'are', JSON.stringify(bids));
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

    function PrebidAdUnit(gptSlot, slotElementId) {
        this.code = slotElementId;
        this.sizes = [[728, 90], [900, 250], [970, 250]];
        this.bids = [
            {
                // 728x90 call
                bidder : 'appnexus',
                params : {placementId: 4298172, referrer: 'http://www.theguardian.com/uk'}
            }, {
                // 900x250 call
                bidder : 'appnexus',
                params : {placementId: 4298047, referrer: 'http://www.theguardian.com/uk'}
            }, {
                // 970x250 call
                bidder : 'appnexus',
                params : {placementId: 4298654, referrer: 'http://www.theguardian.com/uk'}
            }
        ];
    }

    function setupTargeting() {
        pbjs.bidderSettings = {
            standard : {
                adserverTargeting : [{
                    key : 'hb_pb',
                    val : function () {return '1.50';}
                }]
            }
        };
    }

    function getAppNexusBids(gptSlot) {

    }



});
