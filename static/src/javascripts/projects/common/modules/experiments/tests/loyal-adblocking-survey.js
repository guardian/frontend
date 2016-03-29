define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-simple'
], function (
    $,
    config,
    detect,
    storage,
    userFeatures,
    SurveySimple
) {
    return function () {
        this.id = 'LoyalAdblockingSurvey';
        this.start = '2016-03-21';
        this.expiry = '2016-03-31';
        this.author = 'Zofia Korcz';
        this.description = 'An adblock ongoing survey for all loyal users';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We want to understand what causes people to block ads on theguardian.com and what would make them consider unblocking.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'We want to understand what causes people to block ads on theguardian.com and what would make them consider unblocking.';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'variant',
            test: function () {
                detect.adblockInUse.then(function (adblockUsed) {
                    var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
                    if (!adblockUsed && alreadyVisited > 10) {
                        var surveyOverlay = new SurveySimple({
                            id: 'loyal-adblocking-survey',
                            surveyHeader: 'We would like to ask ',
                            surveyText: 'Fearless, quality journalism is not free. Advertising revenue helps to sustain the Guardian\'s future and independence in perpetuity. To continue enjoying the Guardian, please either disable your adblocker on theguardian.com or support us by becoming a Guardian Member for as little as £5 a month.',
                            surveyTextMembership: 'If you are already a paid Guardian Member, please ' + '<a class=\"text-link\" href=\"https://profile.theguardian.com/signin?INTCMP=ADB_RESP_A\" target=\"_blank\" data-link-name=\"adblock membership A\">sign in here</a>.' + ' If you subscribe to the Guardian, ' + '<a class=\"text-link\" href=\"/commercial/subscriber-number" target=\"_blank\" data-link-name=\"adblock subscriber A\">please click here.</a>',
                            surveyTextSubscriber: 'If you are unable to disable your adblocker for any reason, please contact ' + '<a class=\"text-link\" href="mailto:userhelp@theguardian.com" data-link-name="user help email A">userhelp@theguardian.com.</a>',
                            signupText: 'How to disable adblockers on the Guardian',
                            membershipText: 'Become a Member',
                            signupLink: '/info/2016/mar/21/how-to-disable-your-adblocker-for-theguardiancom',
                            membershipLink: 'https://membership.theguardian.com/uk/supporter?INTCMP=ADB_RESP_A',
                            signupDataLink: 'adblock whitelist A',
                            membershipDataLink: 'adblock membership A',
                            subscriberLink: '/commercial/subscriber-number',
                            subscriberText: 'Subscriber number',
                            subscriberDataLink: 'adblock subscriber A',
                            showCloseBtn: true,
                            closePermanently: true
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }];

    };

});
