/*global guardian */
define([
    'common',
    'qwery',
    'bonzo',
    'bean',
    'modules/detect',
    'modules/analytics/adverts',
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
    Sticky,
    transform,
    findLastIndex,
    map) {

    var variantName,
        adViewTimings = [1, 2, 4, 6, 8, 10, 15, 20, 25, 30, 40, 50, 60],
        adDwellTimes = {};


    function initAdDwellTracking() {
        startAdViewTimer();

        // Listen for unload event
        bean.on(window, 'beforeunload', function() {
            common.mediator.emit('module:analytics:adimpression', getAdTimesReport());
        });
    }


    function startAdViewTimer() {
        var $trackedAdSlots = common.$g('.ad-slot');

        setInterval(function() {
            var viewport = detect.getLayoutMode();

            $trackedAdSlots.each(function(adEl) {
                var adId = adEl.getAttribute('data-inview-name') || adEl.getAttribute('data-' + viewport) || '';
                if (adId && isVisible(adEl)) {
                    adDwellTimes[adId] = (adDwellTimes[adId]) ? adDwellTimes[adId] += 1 : 1;
                }
            });
        }, 1000);
    }

    function getAdTimesReport() {
        // This mental piece of code maps the actual advert dwell times to the
        // predefined dwell times in adViewTimings. Pretty sure there's a better
        // way, but it's late, and everyone is gone
        // ex: {MPU: 17, Top: 29}  becomes {MPU: 15, Top: 25}
        var mappedDwellTimes = transform(adDwellTimes, function(result, time, adId) {
            var slottedTimeIndex = findLastIndex(adViewTimings, function(timeSlot) {
                return timeSlot < time;
            });
            result[adId] = adViewTimings[slottedTimeIndex];
        });

        // Convert to string friendly format
        var reportArray = map(mappedDwellTimes, function(val, key) {
            return key+':'+val;
        });

        // Stick the variant name in front
        reportArray.unshift(variantName);

        // Dinner is served with a sprinkling of commas
        return reportArray.join(',');
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
                        initAdDwellTracking();
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
                        initAdDwellTracking();
                    }

                    return true;
                }
            },
            {
                id: 'Both',  //Article C
                test: function() {
                    variantName = 'Both';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    document.body.className += ' test-inline-adverts--on';
                    self.variants.forEach(function(variant){
                        if(variant.id === 'Inline' || variant.id === 'Adhesive') {
                            variant.test.call(self, {}, true);
                        }
                    });

                    // This needs to be last as the previous calls set their own variant hosts
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';

                    initAdDwellTracking();

                    return true;
                }
            },
            {
                id: 'control', //Article D
                test: function() {
                    variantName = 'Control';
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha.com';

                    initAdDwellTracking();

                    return true;
                }
            }
        ];
    };

    return AlphaAdverts;

});
