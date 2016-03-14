define([
    'common/utils/config',
    'common/utils/detect',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-simple'
], function (
    config,
    detect,
    contains,
    userFeatures,
    SurveySimple
) {
    return function () {
        this.id = 'AdblockingResponse';
        this.start = '2016-03-21';
        this.expiry = '2016-03-31';
        this.author = 'Zofia Korcz';
        this.description = 'Adblocking respoonse test';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Adblock users will either become a paid member or turn off the adblock.';
        this.audienceCriteria = 'All users with adblockers turned on.';
        this.dataLinkNames = '';
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
                //TODO check also if not a subscriber
                if (detect.adblockInUseSync() && !config.page.isFront && !userFeatures.isPayingMember()) {
                    new SurveySimple({
                        surveyHeader: 'Personalise your Guardian',
                        surveyText:'To remove all messages from this particular Guardian service simply sign up to the Guardian. To choose exactly which other commercial messages you\'d like to see from the Guardian, or not, become a Member from £5 a month.',
                        signupText: 'Sign-up now',
                        membershipText: 'Become a Member',
                        signupLink: '/commercial/survey-simple-sign-up',
                        membershipLink: '/commercial/survey-simple-membership',
                        signupDataLink: 'signup',
                        membershipDataLink: 'membership',
                        showCloseBtn: false
                    }).attach();
                }
            }
        }, {
            id: 'variantB',
            test: function () {}
        }];

    };

});
