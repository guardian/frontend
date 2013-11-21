/*global guardian */
define([
    'common',
    'qwery',
    'bonzo',
    'bean',
    'utils/detect',
    'modules/analytics/adverts',
    'modules/analytics/livestats-ads',
    'modules/adverts/sticky',
    'lodash/objects/transform',
    'lodash/arrays/findLastIndex',
    'lodash/collections/map'
], function (
    common,
    qwery,
    bonzo,
    bean,
    detect,
    inview,
    LiveStatsAds,
    Sticky,
    transform,
    findLastIndex,
    map) {

    var _config,
        variantName,
        adDwellTimes = {},
        flushInterval = 5000, // every 5 seconds
        trackInterval = 1000,
        maxTrackTime  = 80000; // stop tracking after this time

    /*
        This idea here is that we have two timers. One to monitor whether an advert is in the viewport
        every 1 second, and a second to flush the data to the server every 5 seconds.

        As the user scrolls down the page and views adverts they increment the collective counter on
        the server by one each time they view an advert.

        For example, a user that sticks at the top of the page for 20 seconds will increment the 'Top' slot
        counter by '20' and the server count by '4'.

        We say can the Top slot has been viewed for 20 seconds by 4 instances, or an average of 5 seconds per
        instance.
        
        The highest counter indicates the more viewed the advert.
    */

    function initAdDwellTracking(config) {

        var startTime = new Date().getTime(),
            $trackedAdSlots = common.$g('.ad-slot');
       
        // a timer to submit the data to diagnostics every nth second
        if (config.switches.liveStats) {
            var beaconInterval = setInterval(function() {
                // if there's nothing to report, don't generate the request
                if (Object.keys(adDwellTimes).length === 0) {
                    return false;
                }

                new LiveStatsAds({
                    beaconUrl: config.page.beaconUrl
                }).log(adDwellTimes);

                adDwellTimes = {}; // reset

                // Stop timer if we've gone past the max running time
                var now = new Date().getTime();
                if (now >= startTime + maxTrackTime) {
                    clearInterval(beaconInterval);
                    clearInterval(adTrackInterval);
                }
            }, flushInterval);
        }

        // a timer to monitor the pages for ad-slots inside the viewport
        var adTrackInterval = setInterval(function() {
            var viewport = detect.getLayoutMode();
            $trackedAdSlots.each(function(adEl) {
                var adId = adEl.getAttribute('data-inview-name') || adEl.getAttribute('data-' + viewport) || '';
                if (adId && isVisible(adEl)) {
                    adDwellTimes[adId] = (adDwellTimes[adId]) ? adDwellTimes[adId] += 1 : 1; // has been seen inside this 1 second window
                }
            });
        }, trackInterval);
    }

    function isVisible(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.top < (window.innerHeight || document.body.clientHeight) &&
            rect.left < (window.innerWidth || document.body.clientWidth)
        );
    }

    var AlphaAdverts = function () {

        var self = this,
            nParagraphs = '10',
            inlineTmp = '<div class="ad-slot ad-slot--inline"><div class="ad-container"></div></div>',
            mpuTemp = '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-median="Middle1" data-extended="Middle1"><div class="ad-container"></div></div>',
            supportsSticky = detect.hasCSSSupport('position', 'sticky'),
            supportsFixed  = detect.hasCSSSupport('position', 'fixed', true);

        this.id = 'AlphaAdverts';
        this.expiry = '2013-11-30';
        this.audience = 0.1;
        this.description = 'Test new advert formats for alpha release';
        this.canRun = function(config) {
            _config = config;
            if(config.page.contentType === 'Article') {
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Inline', //Article A
                test: function(context, isBoth) {
                    variantName = 'Inline';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    var article = document.getElementsByClassName('js-article__container')[0];
                    bonzo(qwery('p:nth-of-type('+ nParagraphs +'n)'), article).each(function(el, i) {
                        var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';

                        bonzo(bonzo.create(inlineTmp)).attr({
                            'data-inview-name' : 'Inline',
                            'data-inview-advert' : 'true',
                            'data-base' : 'Top2',
                            'data-median' : 'Middle',
                            'data-extended' : 'Middle'
                        }).addClass(cls).insertAfter(this);
                    });

                    // The timer for the 'Both' variant is setup only once in the variant itself
                    if (!isBoth) {
                        initAdDwellTracking(_config);
                    }

                    return true;
                }
            },
            {
                id: 'Adhesive', //Article B
                test: function(context, isBoth) {
                    variantName = 'Adhesive';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha2.com';
                    var viewport = detect.getLayoutMode(),
                        inviewName,
                        s;
                    if(viewport === 'mobile' || viewport === 'tablet' && detect.getOrientation() === 'portrait') {
                        inviewName = 'Top banner';
                        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', inviewName);
                        bonzo(qwery('.parts__head')).addClass('is-sticky');
                        if(!supportsSticky && supportsFixed) {
                            s = new Sticky({
                                elCls: 'ad-slot--top-banner-ad',
                                id: 'Top2'
                            });
                        }
                    } else {
                        inviewName = 'MPU';
                        document.getElementsByClassName('js-mpu-ad-slot')[0].appendChild(bonzo.create(mpuTemp)[0]);
                        bonzo(qwery('.ad-slot--mpu-banner-ad')).attr('data-inview-name', inviewName);
                        if(!supportsSticky && supportsFixed) {
                            s = new Sticky({
                                elCls: 'js-mpu-ad-slot',
                                id: 'mpu-ad-slot'
                            });
                        }
                    }

                    // The timer for the 'Both' variant is setup only once in the variant itself
                    if (!isBoth) {
                        initAdDwellTracking(_config);
                    }

                    return true;
                }
            },
            {
                id: 'Both',  //Article C
                test: function() {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    document.body.className += ' test-inline-adverts--on';
                    self.variants.forEach(function(variant){
                        if(variant.id === 'Inline' || variant.id === 'Adhesive') {
                            variant.test.call(self, {}, true);
                        }
                    });

                    // This needs to be last as the previous calls set their own variant hosts
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    variantName = 'Both';

                    initAdDwellTracking(_config);

                    return true;
                }
            },
            {
                id: 'control', //Article D
                test: function() {
                    variantName = 'Control';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha.com';

                    initAdDwellTracking(_config);

                    return true;
                }
            }
        ];
    };

    return AlphaAdverts;

});
