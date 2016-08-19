define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-adblock'
], function (
    $,
    config,
    detect,
    storage,
    contains,
    userFeatures,
    SurveyAdBlock
) {
    return function () {
        this.id = 'AdBlockingResponse';
        this.start = '2016-08-17';
        this.expiry = '2016-10-18';
        this.author = 'Justin Pinner';
        this.description = 'Adblocking response';
        this.audience = 0.09;
        this.audienceOffset = 0;
        this.successMeasure = 'Adblocking users will either pay, prove they have a subscription or turn off their adblocker.';
        this.audienceCriteria = 'All users with active adblockers.';
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
            return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint())
                && config.page.edition === 'UK';
        };

        this.variants = [{
            id: 'no-close',
            test: function () {
                detect.adblockInUse.then(function (adblockUsed) {
                    // TODO: remove "|| !config.page.isProd"
                    if ((adblockUsed || !config.page.isProd) && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveyAdBlock({
                            surveyHeader: 'We need to talk about adverts',
                            surveyText: 'It looks like you’re trying to browse the Guardian without seeing any adverts.',
                            surveyTextSecond: 'We understand people can find adverts distracting or intrusive, and we understand that readers have a choice about how and where they consume the news. But not being able to display adverts, regardless of whether readers interact with them or not, reduces funding that is crucial for the Guardian if it is to continue to survive independently.',
                            surveyTextThird: 'To show your support for our world-class journalism, please consider helping us in one of two ways: either by disabling your ad blocking software for theguardian.com, or becoming a paying Guardian Member from £5 per month.',
                            surveyTextMembership: 'If you are already a Guardian Member, please ' + '<a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_no-close\" target=\"_blank\" data-link-name=\"adblock membership no-close\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber no-close\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your ad blocking software for any reason, please contact ' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email no-close">userhelp@theguardian.com.</a>',
                            signupText: 'How to disable adblockers on the Guardian',
                            membershipText: 'Become a Member',
                            signupLink: '/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom',
                            membershipLink: 'https://membership.theguardian.com/uk/supporter?INTCMP=ADB_RESP_no-close',
                            signupDataLink: 'adblock whitelist no-close',
                            membershipDataLink: 'adblock membership no-close',
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
                    // TODO: remove "|| !config.page.isProd"
                    if ((adblockUsed || !config.page.isProd) && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveyAdBlock({
                            surveyHeader: 'We need to talk about adverts',
                            surveyText: 'It looks like you’re trying to browse the Guardian without seeing any adverts.',
                            surveyTextSecond: 'We understand people can find adverts distracting or intrusive, and we understand that readers have a choice about how and where they consume the news. But not being able to display adverts, regardless of whether readers interact with them or not, reduces funding that is crucial for the Guardian if it is to continue to survive independently.',
                            surveyTextThird: 'To show your support for our world-class journalism, please consider helping us in one of two ways: either by disabling your ad blocking software for theguardian.com, or becoming a paying Guardian Member from £5 per month.',
                            surveyTextMembership: 'If you are already a Guardian Member, please ' + '<a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_immediate-close\" target=\"_blank\" data-link-name=\"adblock membership immediate-close\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber immediate-close\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your ad blocking software for any reason, please contact ' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email immediate-close">userhelp@theguardian.com.</a>',
                            signupText: 'How to disable adblockers on the Guardian',
                            membershipText: 'Become a Member',
                            signupLink: '/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom',
                            membershipLink: 'https://membership.theguardian.com/uk/supporter?INTCMP=ADB_RESP_immediate-close',
                            signupDataLink: 'adblock whitelist immediate-close',
                            membershipDataLink: 'adblock membership immediate-close',
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
                    // TODO: remove "|| !config.page.isProd"
                    if ((adblockUsed || !config.page.isProd) && !config.page.isFront &&
                        !userFeatures.isPayingMember() &&
                        config.page.webTitle !== 'Subscriber number form' &&
                        config.page.webTitle !== 'How to disable your adblocker for theguardian.com' &&
                        !storage.local.get('gu.subscriber')) {
                        var surveyOverlay = new SurveyAdBlock({
                            surveyHeader: 'We need to talk about adverts',
                            surveyText: 'It looks like you’re trying to browse the Guardian without seeing any adverts.',
                            surveyTextSecond: 'We understand people can find adverts distracting or intrusive, and we understand that readers have a choice about how and where they consume the news. But not being able to display adverts, regardless of whether readers interact with them or not, reduces funding that is crucial for the Guardian if it is to continue to survive independently.',
                            surveyTextThird: 'To show your support for our world-class journalism, please consider helping us in one of two ways: either by disabling your ad blocking software for theguardian.com, or becoming a paying Guardian Member from £5 per month.',
                            surveyTextMembership: 'If you are already a Guardian Member, please ' + '<a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_delayed-close\" target=\"_blank\" data-link-name=\"adblock membership delayed-close\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber delayed-close\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your ad blocking software for any reason, please contact ' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email delayed-close">userhelp@theguardian.com.</a>',
                            signupText: 'How to disable adblockers on the Guardian',
                            membershipText: 'Become a Member',
                            signupLink: '/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom',
                            membershipLink: 'https://membership.theguardian.com/uk/supporter?INTCMP=ADB_RESP_delayed-close',
                            signupDataLink: 'adblock whitelist delayed-close',
                            membershipDataLink: 'adblock membership delayed-close',
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
