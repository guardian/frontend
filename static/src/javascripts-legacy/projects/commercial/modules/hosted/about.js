define([
    'Promise',
    'commercial/modules/survey/survey-simple'
], function (
    Promise,
    SurveySimple
) {
    function init() {
        var survey = new SurveySimple({
            id: 'hosted-about',
            header: 'Advertiser content',
            paragraph1: 'Advertiser content is used to describe advertisement features that are paid for, produced and controlled by the advertiser rather than the publisher​.',
            paragraph2: 'They​ are subject to regulation by the Advertising Standards Authority in the UK, the Federal Trade Commission in the US and the Advertising Standards Bureau in Australia.',
            paragraph3: 'This content is produced by the advertiser and does not involve Guardian News and Media staff.',
            showCloseBtn: true
        });

        return survey.attach()
        .then(function () {
            var aboutBtn = document.querySelector('.js-hosted-about');
            var overlay = document.querySelector('.js-survey-overlay');

            aboutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                overlay.classList.remove('u-h');
            });
        });
    }

    return {
        init: init
    };
});
