/*global guardian */
define([
    'common/common',
    'qwery',
    'bonzo',
    'bean',
    'common/utils/detect',
    'common/modules/analytics/adverts',
    'common/modules/analytics/livestats-ads',
    'common/modules/adverts/sticky',
    'lodash/objects/transform',
    'lodash/arrays/findLastIndex',
    'lodash/collections/map',
    'lodash/functions/debounce'
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
    map,
    debounce
) {



  /*! adapted from Idle.Js, copyright 2013-04-27, Shawn Mclean
  *
  * Essentially we set up a dead man's switch on the isAway flag.
  *
  * If any activity on the page is detected we restart the countdown
  * with a debounce. If no activity is detected the switch is set to on. 
  *
  * */
  var Idle = function () {
      
      this.isAway = true; // false = the user is active on the page, true = the user is inactive
      this.awayTimeout = 5000;

      var startInactivityTimeout,
          logActivity,
          self = this;
     
      startInactivityTimeout = debounce(function() {
        self.setInactive();
      }, this.awayTimeout);
      
      logActivity = function () {
        self.isAway = false;
      };

      // sensors
      bean.on(window, 'click keydown', startInactivityTimeout);
      bean.on(window, 'scroll mousemove', debounce(startInactivityTimeout, 100));
      bean.on(window, 'click keydown', logActivity);
      bean.on(window, 'scroll mousemove', debounce(logActivity, 100));

    };

    Idle.prototype.setInactive = function () {
      this.isAway = true;
    };


    // 
    var _config,
        variantName,
        adDwellTimes = {},
        flushInterval = 3000, // every 2 seconds
        trackInterval = 1000,
        maxTrackTime  = 90000, // stop tracking after this time
        instanceId = Math.random(), // each page view generates a temporary user 'id'
        idle = new Idle();
        
    /*
        This idea here is that we have two timers. One to monitor whether an advert is in the viewport
        every 1 second, and a second to flush the data to the server every 5 seconds.

        As the user scrolls down the page and views adverts they increment the collective counter on
        the server by the number of seconds the user has spent viewing an advert slot.

        The highest counter indicates the more viewed the advert.

        The idle object allows us to stop flushing data to the server for the period of time where the user
        is inactive. 
    */

    function initAdDwellTracking(config, variant) {

        var startTime = new Date().getTime(),
            $trackedAdSlots = common.$g('.ad-slot'),
            firstRun = true;

        // a timer to submit the data to diagnostics every nth second
        if (config.switches.liveStats) {
        
            var beaconInterval = setInterval(function() {

                // if there's nothing to report, don't generate the request
                if (Object.keys(adDwellTimes).length === 0) {
                    return false;
                }

                if (firstRun) {
                    adDwellTimes.first = 1;
                }

                adDwellTimes.layout = detect.getBreakpoint();
                adDwellTimes.variant = variant;
                adDwellTimes.id = instanceId;

                new LiveStatsAds({
                    beaconUrl: config.page.beaconUrl
                }).log(adDwellTimes);

                adDwellTimes = {}; // reset
                firstRun = false;

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
           
            // don't do anything if the user is idle 
            if (idle.isAway) {
                return;
            }

            var viewport = detect.getBreakpoint();
            // NOTE:  getLayoutMode used to return 'extended' for 'wide'; this makes it backwards compatible
            viewport = (viewport === 'wide') ? 'extended' : viewport;
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

    var AlphaComm = function () {

        var self = this,
            nParagraphs = '10',
            inlineTmp = '<div class="ad-slot ad-slot--inline"><div class="ad-container"></div></div>',
            mpuTemp = '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-median="Middle1" data-extended="Middle1"><div class="ad-container"></div></div>',
            supportsSticky = detect.hasCSSSupport('position', 'sticky'),
            supportsFixed  = detect.hasCSSSupport('position', 'fixed', true);

        this.id = 'AlphaComm';
        this.expiry = '2013-12-24';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.description = 'Test new advert formats for alpha release';
        this.canRun = function(config) {
            if(config.page.contentType === 'Article') {
                return true;
            } else {
                return false;
            }
        };
        this.variants = [
            {
                id: 'Inline', //Article A
                test: function(context, config, isBoth) {
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

                    bonzo(qwery('.ad-slot--bottom-banner-ad')).attr('data-inview-name', 'Bottom');
                    bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', 'Top');

                    // The timer for the 'Both' variant is setup only once in the variant itself
                    if (!isBoth) {
                        initAdDwellTracking(config, this.id);
                    }

                    return true;
                }
            },
            {
                id: 'Adhesive', //Article B
                test: function(context, config, isBoth) {
                    variantName = 'Adhesive';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha2.com';
                    var viewport = detect.getBreakpoint(),
                        inviewName,
                        s;
                    if(viewport === 'mobile' || viewport === 'tablet' && detect.getOrientation() === 'portrait') {
                        inviewName = 'Top';
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
                        
                        bonzo(qwery('.js-mpu-ad-slot .social-wrapper')).after(bonzo.create(mpuTemp)[0]);
                        bonzo(qwery('.ad-slot--mpu-banner-ad')).attr('data-inview-name', inviewName);
                        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', 'Top');
                        bonzo(qwery('.js-mpu-ad-slot')).addClass('is-sticky');
                        
                        // Mwahahaha 
                        bonzo(qwery('.mpu-context .open-cta')).remove();

                        if(!supportsSticky && supportsFixed) {
                            s = new Sticky({
                                elCls: 'js-mpu-ad-slot',
                                id: 'mpu-ad-slot'
                            });
                        }
                    }

                    bonzo(qwery('.ad-slot--bottom-banner-ad')).attr('data-inview-name', 'Bottom');

                    // The timer for the 'Both' variant is setup only once in the variant itself
                    if (!isBoth) {
                        initAdDwellTracking(config, this.id);
                    }

                    return true;
                }
            },
            {
                id: 'Both',  //Article C
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    document.body.className += ' test-inline-adverts--on';
                    self.variants.forEach(function(variant){
                        if(variant.id === 'Inline' || variant.id === 'Adhesive') {
                            variant.test.call(self, context, config, true);
                        }
                    });

                    // This needs to be last as the previous calls set their own variant hosts
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    variantName = 'Both';

                    initAdDwellTracking(config, this.id);

                    return true;
                }
            },
            {
                id: 'Static',
                test: function(context, config) {
                    variantName = 'Static';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha4.com';
                    
                    bonzo(qwery('.ad-slot--bottom-banner-ad')).attr('data-inview-name', 'Bottom');
                    
                    var viewport = detect.getBreakpoint(),
                        inviewName,
                        s;
                    if(viewport === 'mobile' || viewport === 'tablet' && detect.getOrientation() === 'portrait') {
                        inviewName = 'Top';
                        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', inviewName);
                    } else {
                        inviewName = 'MPU';
                        bonzo(qwery('.js-mpu-ad-slot .social-wrapper')).after(bonzo.create(mpuTemp)[0]);
                        bonzo(qwery('.ad-slot--mpu-banner-ad')).attr('data-inview-name', inviewName);
                        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', 'Top');
                    }
                    // This needs to be last as the previous calls set their own variant hosts
                    initAdDwellTracking(config, this.id);
                    return true;
                }
            },
            {
                id: 'control', //Article D
                test: function(context, config) {
                    variantName = 'Control';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha.com';
                    bonzo(qwery('.ad-slot--bottom-banner-ad')).attr('data-inview-name', 'Bottom');
                    bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-inview-name', 'Top');

                    initAdDwellTracking(config, this.id);

                    return true;
                }
            }
        ];
    };

    return AlphaComm;

});

