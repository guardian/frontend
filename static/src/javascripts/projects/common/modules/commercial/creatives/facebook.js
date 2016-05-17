/* global FB */
define([
    'fastdom',
    'common/utils/detect',
    'common/utils/cookies',
    'common/utils/template',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/facebook.html'
], function(fastdom, detect, cookies, template, addTrackingPixel, facebookStr) {
    var scriptId = 'facebook-jssdk';
    var scriptSrc = '//connect.facebook.net/en_US/sdk/xfbml.ad.js#xfbml=1&version=v2.5';
    var appNetworkId = '978824118882656';
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
                    //console.log('ad error ' + errorCode + ' at ' + placementID + ': ' + errorMessage);
                }
            );
        });

        var markup = facebookTpl(adUnits[this.params.placement]);
        fastdom.write(function () {
            this.$adSlot[0].insertAdjacentHTML('beforeend', markup);

            if (this.params.trackingPixel) {
                addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
            }

            insertFbScript();
        }, this);
    }

    function insertFbScript() {
        if (document.getElementById(scriptId)) {
            return;
        }
        // we need the SCRIPT element to have an ID so we won't be using curl.js
        // this time, sorry guys
        var ref = document.scripts[0];
        var script = document.createElement('script');
        script.id = scriptId;
        script.src = scriptSrc + '&appId=' + appNetworkId;
        ref.parentNode.insertBefore(script, ref);
    }

    return Facebook;
});
