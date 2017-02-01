define([
    'Promise',
    'bean',
    'common/utils/$',
    'commercial/modules/survey/survey-simple',
    'commercial/modules/dfp/performance-logging'
], function (
    Promise,
    bean,
    $,
    SurveySimple,
    performanceLogging
) {
    function init(moduleName) {
        performanceLogging.moduleStart(moduleName);

        var survey = new SurveySimple({
            id: 'hosted-about',
            header: 'Advertiser content',
            paragraph1: 'Advertiser content is used to describe advertisement features that are paid for, produced and controlled by the advertiser rather than the publisher​.',
            paragraph2: 'They​ are subject to regulation by the Advertising Standards Authority in the UK, the Federal Trade Commission in the US and the Advertising Standards Bureau in Australia.',
            paragraph3: 'This content is produced by the advertiser and does not involve Guardian News and Media staff.',
            showCloseBtn: true
        });

        survey.attach();

        bean.on(document, 'click', $('.js-hosted-about'), function (e) {
            e.preventDefault();
            $('.js-survey-overlay').removeClass('u-h');
        });

        performanceLogging.moduleEnd(moduleName);

        return Promise.resolve();
    }

    return {
        init: init
    };
});
