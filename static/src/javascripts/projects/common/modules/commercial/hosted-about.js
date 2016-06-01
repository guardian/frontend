define([
    'bean',
    'common/utils/$',
    'common/modules/commercial/survey/survey-simple'
], function (
    bean,
    $,
    SurveySimple
) {
    function init() {
        var survey = new SurveySimple({
            id: 'hosted-about',
            surveyHeader: 'Advertiser content is used to describe advertisement features that are paid for, produced and controlled by the advertiser rather than the publisher​.',
            surveyText: 'They​ are subject to regulation by the Advertising Standards Authority in the UK, the Federal Trade Commission in the US and the Advertising Standards Bureau in Australia.',
            surveySubText: 'This content is produced by the advertiser and does not involve GNM staff.',
            showCloseBtn: true
        });

        survey.attach();

        bean.on(document, 'click', $('.js-hosted-about'), function (e) {
            e.preventDefault();
            $('.js-survey-overlay').removeClass('u-h');
        });
    }

    return {
        init: init
    };
});
