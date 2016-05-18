/* global FB */
define([
    'fastdom',
    'common/utils/config',
    'common/utils/template',
    'common/utils/load-script',
    'common/utils/report-error',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/facebook.html'
], function(fastdom, config, template, loadScript, reportError, addTrackingPixel, facebookStr) {
    var scriptId = 'facebook-jssdk';
    var scriptSrc = '//connect.facebook.net/en_US/sdk/xfbml.ad.js#xfbml=1&version=v2.5';
    var adUnits = {
        mpu: { placementId: '978824118882656_978826235549111', adId: 'fb_ad_root_mpu' }
    };
    var facebookTpl;

    function Facebook($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
        facebookTpl || (facebookTpl = template(facebookStr));
    }

    Facebook.prototype.create = function () {
        window.fbAsyncInit || (window.fbAsyncInit = function() {
            FB.Event.subscribe(
                'ad.loaded',
                function(placementID) {
                    var interim = document.querySelector('[data-placementid="' + placementID + '"]');
                    var ad = document.getElementById(interim.getAttribute('data-nativeadid'));
                    if (ad) {
                        fastdom.write(function () {
                            ad.style.display = 'block';
                        });
                    }
                }
            );

            FB.Event.subscribe(
                'ad.error',
                function(errorCode, errorMessage, placementID) {
                    reportError(new Error('Facebook returned an empty ad response'), {
                        feature: 'commercial',
                        placementID: placementID,
                        errorMessage: errorMessage
                    }, false);
                }
            );
        });

        var markup = facebookTpl(adUnits[this.params.placement]);
        fastdom.write(function () {
            this.$adSlot[0].insertAdjacentHTML('beforeend', markup);

            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }

            loadScript({ id: scriptId, src: scriptSrc + '&appId=' + config.page.fbAppId});
        }, this);
    };


    return Facebook;
});
