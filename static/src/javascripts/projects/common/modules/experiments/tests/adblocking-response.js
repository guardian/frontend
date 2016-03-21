define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-simple'
], function (
    $,
    config,
    detect,
    storage,
    contains,
    userFeatures,
    SurveySimple
) {
    return function () {
        this.id = 'AdblockingResponse';
        this.start = '2016-03-21';
        this.expiry = '2016-03-31';
        this.author = 'Zofia Korcz';
        this.description = 'Adblocking response test';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Adblock users will either become a paid member or turn off the adblock.';
        this.audienceCriteria = 'All users with adblockers turned on.';
        this.dataLinkNames = 'adblock response overlay: adblock whitelist A, adblock membership A, subscriber number A, user help email A, adblock whitelist B, adblock membership B, subscriber number B, user help email B, subscriber number page: user help email';
        this.idealOutcome = 'Adblock users will either become a paid member or turn off the adblock.';

        this.canRun = function () {
            return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint())
                && config.page.edition === 'UK';
        };

        this.variants = [{
            id: 'control',
            test: function () {}
        }, {
            id: 'variantA',
            test: function () {
                detect.getFfOrGenericAdbockInstalled.then(function (adblockUsed) {
                    if (adblockUsed && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveySimple({
                            surveyHeader: 'You appear to have an ad blocker enabled on theguardian.com',
                            surveyText: 'Fearless, quality journalism is not free. Advertising revenue helps to sustain the Guardian\'s future and independence in perpetuity. To continue enjoying the Guardian, please either disable your ad blocker on theguardian.com ' + '<a class=\"text-link\" href=\"/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom" target=\"_blank\" data-link-name=\"adblock whitelist A\">(click here to find out how)</a>' + ' or support us by becoming a paid member of the Guardian for as little as £5 a month.',
                            surveyTextMembership: 'If you are already a paid Guardian Member, please ' + '<a class=\"text-link\" href=\"https://membership.theguardian.com/?INTCMP=ADB_RESP_A\" target=\"_blank\" data-link-name=\"adblock membership A\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber A\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your ad blocker for any reason, please contact' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email A">userhelp@theguardian.com.</a>',
                            signupText: 'Whitelist',
                            membershipText: 'Become a Member',
                            signupLink: '/commercial/survey-simple-sign-up',
                            membershipLink: 'https://membership.theguardian.com/?INTCMP=ADB_RESP_A',
                            signupDataLink: 'adblock whitelist A',
                            membershipDataLink: 'adblock membership A',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber A',
                            showCloseBtn: false
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }, {
            id: 'variantB',
            test: function () {
                detect.getFfOrGenericAdbockInstalled.then(function (adblockUsed) {
                    if (adblockUsed && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveySimple({
                            surveyHeader: 'We need to talk about adblocking',
                            surveyText: 'It looks like you’re trying to browse The Guardian with an adblocker installed.',
                            surveyTextSecond: 'We understand people can find adverts distracting and intrusive. We understand that readers have a choice how they read the news, and where they read it. But without funding, the Guardian has no way to survive independently.',
                            surveyTextThird: 'To continue enjoying our journalism, please support us in one of two ways: either by disabling your ad blocker for theguardian.com ' + '<a class=\"text-link\" href=\"/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom" target=\"_blank\" data-link-name=\"adblock whitelist B\">(here\'s how)</a>' +' , or by becoming a Guardian Member for as little as £5 a month.',
                            surveyTextMembership: 'If you are already a paid Guardian Member, please ' + '<a class=\"text-link\" href=\"https://membership.theguardian.com/?INTCMP=ADB_RESP_B\" target=\"_blank\" data-link-name=\"adblock membership B\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber B\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your ad blocker for any reason, please contact ' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email B">userhelp@theguardian.com.</a>',
                            signupText: 'Whitelist',
                            membershipText: 'Become a Member',
                            signupLink: '/commercial/survey-simple-sign-up',
                            membershipLink: 'https://membership.theguardian.com/?INTCMP=ADB_RESP_B',
                            signupDataLink: 'adblock whitelist B',
                            membershipDataLink: 'adblock membership B',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber B',
                            showCloseBtn: false
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }];

    };

});
