define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'lodash/collections/contains',
    'common/modules/commercial/user-features',
    'common/modules/commercial/survey/survey-simple'
], function (
    $,
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
                detect.getFfOrGenericAdbockInstalled.then(function (adblockUsed) {
                    if (adblockUsed && !config.page.isFront && !userFeatures.isPayingMember()) {
                        var surveyOverlay = new SurveySimple({
                            surveyHeader: 'You appear to have an adblocker installed',
                            surveyText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et quam auctor, efficitur velit nec, ullamcorper elit. Sed ac pharetra mauris. Curabitur blandit est vel commodo lobortis. Curabitur ullamcorper ante in massa maximus pharetra. Aliquam erat volutpat. In sed arcu velit. Vivamus nisl eros, venenatis ac imperdiet nec, lobortis sed lorem. Vestibulum et dictum eros, et finibus dui.',
                            signupText: 'Whitelist',
                            membershipText: 'Become a Member',
                            signupLink: '/commercial/survey-simple-sign-up',
                            membershipLink: '/commercial/survey-simple-membership',
                            signupDataLink: 'adblock whitelist',
                            membershipDataLink: 'adblock membership',
                            showCloseBtn: false
                        });
                        surveyOverlay.attach();
                        surveyOverlay.show();
                    }
                });
            }
        }, {
            id: 'variantB',
            test: function () {}
        }];

    };

});
