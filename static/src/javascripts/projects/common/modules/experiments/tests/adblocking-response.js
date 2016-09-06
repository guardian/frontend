define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-adblock',
    'common/utils/cookies'
], function (
    $,
    config,
    detect,
    storage,
    contains,
    userFeatures,
    SurveyAdBlock,
    cookies
) {
    return function () {
        this.id = 'AdBlockingResponse';
        this.start = '2016-08-17';
        this.expiry = '2016-10-18';
        this.author = 'Justin Pinner';
        this.description = 'Adblocking response ZERO PERCENT TEST WITH 10 MINUTES GRACE';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Adblocking users will either pay, prove they have a subscription or turn off their adblocker.';
        this.audienceCriteria = 'All non-Firefox users with active adblockers.';
        var variantDataLinkNames = [
            ['adblock whitelist no-close'],
            ['adblock membership no-close'],
            ['subscriber number no-close'],
            ['user help email no-close'],
            ['adblock whitelist immediate-close'],
            ['adblock membership immediate-close'],
            ['subscriber number immediate-close'],
            ['user help email immediate-close'],
            ['adblock whitelist delayed-close'],
            ['adblock membership delayed-close'],
            ['subscriber number delayed-close'],
            ['user help email delayed-close']
        ].map(function(_) {
            return _[0];
        }).join(', ');
        this.dataLinkNames = 'adblock response overlay: '+variantDataLinkNames+', subscriber number page: user help email';
        this.idealOutcome = 'Adblocking users will either pay or allow ads.';

        this.canRun = function () {
            return contains('chrome', detect.getUserAgent.browser.toLowerCase())
                && contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint())
                && config.page.edition === 'UK'
                && !cookies.get('gu_abm_x');
        };

        this.variants = [{
            id: 'no-close',
            test: function () {
                detect.adblockInUse.then(function (adblockUsed) {
                    if (adblockUsed && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        storage.local.isStorageAvailable() &&
                        !storage.local.get('gu.subscriber')
                    ) {
                        var surveyOverlay = new SurveyAdBlock({
                            surveyHeader: 'Advertising helps fund our journalism',
                            surveyText: 'Please allow adverts on the Guardian so we can continue to bring you quality news into the future.',
                            surveyTextSecond: 'Thanks for supporting us.',
                            surveyTextThird: '<hr /><p class="survey-text__info">How to allow ads on the Guardian. (<a class="text-link" href="/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom?INTCMP=ADB_RESP_no-close" target="_blank">detailed instructions</a>)</p><div class="image-link-container"><a href="/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom?INTCMP=ADB_RESP_no-close" target="_blank"></a></div><p class="survey-text__info"><strong>Ad Block:</strong> Click the <img src="/assets/images/commercial/ab-icon.png" width="20px"/> icon &#x2794; &quot;Don\'t run on pages on this domain&quot; &#x2794; &quot;Exclude&quot;</p><p class="survey-text__info"><strong>Ad Block Plus:</strong> Click the <img src="/assets/images/commercial/abp-icon.png" width="20px"/> icon &#x2794; &quot;Disable on theguardian.com&quot;</p>',
                            surveyTextMembership: 'Already paying? <a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_no-close\" target=\"_blank\" data-link-name=\"adblock supporter no-close\">supporter sign in</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber no-close\">subscriber sign in</a>',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber no-close',
                            showCloseBtn: false
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }, {
            id: 'immediate-close',
            test: function () {
                detect.adblockInUse.then(function (adblockUsed) {
                    if (adblockUsed && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        storage.local.isStorageAvailable() &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveyAdBlock({
                            surveyHeader: 'Advertising helps fund our journalism',
                            surveyText: 'Please allow adverts on the Guardian so we can continue to bring you quality news into the future.',
                            surveyTextSecond: 'Thanks for supporting us.',
                            surveyTextThird: '<hr /><p class="survey-text__info">How to allow ads on the Guardian. (<a class="text-link" href="/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom?INTCMP=ADB_RESP_immediate-close" target="_blank">detailed instructions</a>)</p><div class="image-link-container"><a href="/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom?INTCMP=ADB_RESP_immediate-close" target="_blank"></a></div><p class="survey-text__info"><strong>Ad Block:</strong> Click the <img src="/assets/images/commercial/ab-icon.png" width="20px"/> icon &#x2794; &quot;Don\'t run on pages on this domain&quot; &#x2794; &quot;Exclude&quot;</p><p class="survey-text__info"><strong>Ad Block Plus:</strong> Click the <img src="/assets/images/commercial/abp-icon.png" width="20px"/> icon &#x2794; &quot;Disable on theguardian.com&quot;</p>',
                            surveyTextMembership: 'Already paying? <a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_immediate-close\" target=\"_blank\" data-link-name=\"adblock supporter immediate-close\">supporter sign in</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber immediate-close\">subscriber sign in</a>',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber immediate-close',
                            showCloseBtn: true
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }, {
            id: 'delayed-close',
            test: function () {
                detect.adblockInUse.then(function (adblockUsed) {
                    if (adblockUsed && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        storage.local.isStorageAvailable() &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveyAdBlock({
                            surveyHeader: 'Advertising helps fund our journalism',
                            surveyText: 'Please allow adverts on the Guardian so we can continue to bring you quality news into the future.',
                            surveyTextSecond: 'Thanks for supporting us.',
                            surveyTextThird: '<hr /><p class="survey-text__info">How to allow ads on the Guardian. (<a class="text-link" href="/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom?INTCMP=ADB_RESP_delayed-close" target="_blank">detailed instructions</a>)</p><div class="image-link-container"><a href="/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom?INTCMP=ADB_RESP_delayed-close" target="_blank"></a></div><p class="survey-text__info"><strong>Ad Block:</strong> Click the <img src="/assets/images/commercial/ab-icon.png" width="20px"/> icon &#x2794; &quot;Don\'t run on pages on this domain&quot; &#x2794; &quot;Exclude&quot;</p><p class="survey-text__info"><strong>Ad Block Plus:</strong> Click the <img src="/assets/images/commercial/abp-icon.png" width="20px"/> icon &#x2794; &quot;Disable on theguardian.com&quot;</p>',
                            surveyTextMembership: 'Already paying? <a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_delayed-close\" target=\"_blank\" data-link-name=\"adblock supporter delayed-close\">supporter sign in</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber delayed-close\">subscriber sign in</a>',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber delayed-close',
                            showCloseBtn: 'delayed'
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }];

    };

});
