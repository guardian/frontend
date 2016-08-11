/* global FB */
define([
    'Promise',
    'fastdom',
    'common/utils/config',
    'common/utils/assign',
    'common/views/svgs',
    'common/utils/template',
    'common/utils/load-script',
    'common/utils/report-error',
    'common/modules/ui/toggles',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/facebook.html',
    'text!common/views/commercial/gustyle/label.html'
], function(Promise, fastdom, config, assign, svgs, template, loadScript, reportError, Toggles, addTrackingPixel, facebookStr, labelStr) {
    var scriptId = 'facebook-jssdk';
    var scriptSrc = '//connect.facebook.net/en_US/sdk/xfbml.ad.js#xfbml=1&version=v2.5';
    var adUnits = {
        mpu: { placementId: '180444840287_10154600557405288', adId: 'fb_ad_root_mpu' }
    };
    var facebookTpl;
    var labelTpl;

    function Facebook($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
        facebookTpl || (facebookTpl = template(facebookStr));
        labelTpl || (labelTpl = template(labelStr));
    }

    Facebook.prototype.create = function () {
        return new Promise(function (resolve, reject) {
            window.fbAsyncInit || (window.fbAsyncInit = function() {
                FB.Event.subscribe(
                    'ad.loaded',
                    function(placementID) {
                        var interim = document.querySelector('[data-placementid="' + placementID + '"]');
                        var ad = document.getElementById(interim.getAttribute('data-nativeadid'));
                        if (ad) {
                            fastdom.write(function () {
                                ad.style.display = 'block';
                                resolve(true);
                            });
                        } else {
                            resolve(false);
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
                        reject();
                    }
                );
            });

            var markup = facebookTpl(assign({ externalLink: svgs('externalLink'), testMode: this.params.testMode }, adUnits[this.params.placement]));
            var labelMarkup = labelTpl({ data: {
                buttonTitle: 'Ad',
                infoTitle: 'Advertising on the Guardian',
                infoText: 'is created and paid for by third parties.',
                infoLinkText: 'Learn more about how advertising supports the Guardian.',
                infoLinkUrl: 'https://www.theguardian.com/advertising-on-the-guardian',
                icon: svgs('arrowicon', ['gu-comlabel__icon']),
                dataAttr: this.$adSlot[0].id
            }});

            fastdom.write(function () {
                this.$adSlot[0].insertAdjacentHTML('beforeend', markup);
                this.$adSlot[0].lastElementChild.insertAdjacentHTML('afterbegin', labelMarkup);
                this.$adSlot.addClass('ad-slot--facebook');
                if (this.params.trackingPixel) {
                    addTrackingPixel(this.$adSlot, this.params.trackingPixel + this.params.cacheBuster);
                }
                new Toggles(this.$adSlot[0]).init();
                loadScript({ id: scriptId, src: scriptSrc + '&appId=' + config.page.fbAppId});
            }, this);
        }.bind(this));
    };


    return Facebook;
});
