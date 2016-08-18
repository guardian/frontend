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
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Adblocking users will either pay, prove they have a subscription or turn off their adblocker.';
        this.audienceCriteria = 'All users with active adblockers.';
        this.dataLinkNames = 'adblock response overlay: adblock whitelist A, adblock membership A, subscriber number A, user help email A, subscriber number page: user help email';
        this.idealOutcome = 'Adblocking users will either pay or allow ads.';

        this.canRun = function () {
            return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
                //&& config.page.edition === 'UK';
        };

        this.variants = [{
            id: 'control',
            test: function () {}
        }, {
            id: 'variant',
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
                            surveyTextMembership: 'If you are already a Guardian Member, please ' + '<a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_A\" target=\"_blank\" data-link-name=\"adblock membership A\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber A\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your ad blocking software for any reason, please contact ' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email A">userhelp@theguardian.com.</a>',
                            signupText: 'How to disable adblockers on the Guardian',
                            membershipText: 'Become a Member',
                            signupLink: '/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom',
                            membershipLink: 'https://membership.theguardian.com/uk/supporter?INTCMP=ADB_RESP_A',
                            signupDataLink: 'adblock whitelist A',
                            membershipDataLink: 'adblock membership A',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber A',
                            showCloseBtn: true
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }];

    };

});
