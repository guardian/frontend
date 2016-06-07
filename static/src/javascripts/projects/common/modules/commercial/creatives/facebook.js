/* global FB */
define([
    'Promise',
    'fastdom',
    'common/utils/config',
    'common/utils/template',
    'common/utils/load-script',
    'common/utils/report-error',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/facebook.html'
], function(Promise, fastdom, config, template, loadScript, reportError, addTrackingPixel, facebookStr) {
    var scriptId = 'facebook-jssdk';
    var scriptSrc = '//connect.facebook.net/en_US/sdk/xfbml.ad.js#xfbml=1&version=v2.5';
    var adUnits = {
        mpu: { placementId: '180444840287_10154600557405288', adId: 'fb_ad_root_mpu' }
    };
    var facebookTpl;

    function Facebook($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
        facebookTpl || (facebookTpl = template(facebookStr));
    }

    Facebook.prototype.create = function () {
        return new Promise(function (resolve) {
            window.fbAsyncInit || (window.fbAsyncInit = function() {
                FB.Event.subscribe(
                    'ad.loaded',
                    function(placementID) {
                        var interim = document.querySelector('[data-placementid="' + placementID + '"]');
                        var ad = document.getElementById(interim.getAttribute('data-nativeadid'));
                        fastdom.write(function () {
                            ad.style.display = 'block';
                        });
                        resolve(true);
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
                        resolve(false);
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
        });
    };


    return Facebook;
});
