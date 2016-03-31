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
        this.expiry = '2016-05-31';
        this.author = 'Zofia Korcz';
        this.description = 'An adblock ongoing survey for all loyal users';
        this.audience = 0;
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
                    if (alreadyVisited > 10) {
                        var surveyOverlay = new SurveySimple({
                            id: 'loyal-adblocking-survey',
                            surveyHeader: 'We would like you to take part in a short Guardian survey',
                            surveyText: 'Your views are essential to us and the feedback we receive will help us better meet your needs.',
                            buttonText: 'Take part',
                            buttonLink: adblockUsed ? 'https://surveys.theguardian.com/R.aspx?a=684&as=AC5tF8XE6G&t=1' : 'https://surveys.theguardian.com/R.aspx?a=685&as=Aj5jo96J9j&t=1',
                            buttonDataLink: 'adblock membership A',
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
