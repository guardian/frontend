/* global FB */
/* eslint no-console:0 */
define([
    'fastdom',
    'common/utils/detect',
    'common/utils/cookies',
    'common/utils/template',
    'text!common/views/commercial/facebook.html'
], function(fastdom, detect, cookies, template, facebookStr) {
    var scriptId = 'facebook-jssdk';
    var scriptSrc = '//connect.facebook.net/en_US/sdk/xfbml.ad.js#xfbml=1&version=v2.5';
    var appNetworkId = '978824118882656';
    var adUnits = [
        {
            referenceNode: '#top > .l-side-margins > :first-child',
            where: 'beforebegin',
            placementId: '978824118882656_978826235549111',
            adId: 'ad_root'
        }
    ];
    var facebookTpl;

    return {
        load: init
    };

    function init() {
        if (!(cookies.get('adtest') === 'fbnative' && detect.getBreakpoint() === 'mobile')) {
            return;
        }

        window.fbAsyncInit = function() {
            FB.Event.subscribe(
                'ad.loaded',
                function(placementID) {
                    var interim = document.querySelector('[data-placementid="' + placementID + '"]');
                    var adSlot = document.getElementById(interim.getAttribute('data-nativeadid'));
                    if (adSlot) {
                        fastdom.write(function () {
                            adSlot.style.display = 'block';
                        });
                    }
                }
            );

            FB.Event.subscribe(
                'ad.error',
                function(errorCode, errorMessage, placementID) {
                    console.log('ad error ' + errorCode + ' at ' + placementID + ': ' + errorMessage);
                }
            );
        };

        insertAdUnits();

        // we need the SCRIPT element to have an ID so we won't be using curl.js
        // this time, sorry guys
        insertFbScript();
    }

    function insertAdUnits() {
        facebookTpl = template(facebookStr);
        adUnits.forEach(function (adUnit) {
            adUnit.referenceNode = document.querySelector(adUnit.referenceNode);
            adUnit.markup = facebookTpl(adUnit);
        });
        fastdom.write(function () {
            adUnits.forEach(function (adUnit) {
                adUnit.referenceNode.insertAdjacentHTML(
                    adUnit.where,
                    adUnit.markup
                );
            });
            adUnits = null;
        });
    }

    function insertFbScript() {
        var ref = document.scripts[0];
        var script = document.createElement('script');
        script.id = scriptId;
        script.src = scriptSrc + '&appId=' + appNetworkId;
        fastdom.write(function () {
            ref.parentNode.insertBefore(script, ref);
        });
    }
});
