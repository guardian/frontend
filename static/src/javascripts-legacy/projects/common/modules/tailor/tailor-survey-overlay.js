define([
    'lib/fastdom-promise',
    'lib/config',
    'lib/detect',
    'lib/cookies',
    'lib/template',
    'common/modules/tailor/tailor',
    'raw-loader!common/views/tailor-survey-overlay.html',
    'common/views/svgs'
], function(
    fastdomPromise,
    config,
    detect,
    cookies,
    template,
    tailor,
    tailorSurveyOverlayTemplate,
    svgs
) {

    function shouldCallTailor() {
        return  !config.page.shouldHideAdverts &&
                !config.page.isSensitive &&
                !config.page.isFront &&
                !cookies.get('GU_TAILOR_SURVEY_2') &&
                detect.getBreakpoint() !== 'mobile';
    }

    function handleResponse(response) {
        return fastdomPromise.write(function () {
            var surveyOverlay = document.createElement('div');

            surveyOverlay.classList.add('tailor-survey-overlay');

            surveyOverlay.innerHTML = template(tailorSurveyOverlayTemplate, {
                headerCopy: getHeaderCopy(),
                chevronRight: svgs('chevronRight')
            });

            document.body.appendChild(surveyOverlay);
        });
    }

    function getHeaderCopy() {
        if (config.page.edition === 'AU') {
            return 'We would like you to take part in a short Guardian survey';
        } else {
            return 'Take part in a survey for the Guardian and win Amazon vouchers';
        }
    }

    function onSurveyAdded() {
         // cookies.add('GU_TAILOR_SURVEY_2', 1, 100); // do not show this survey to the user for the next 100 days
    }

    function init() {
        var bwid = cookies.get('bwid') || 'Qb6TGfeA6wRVyIkMkm7z9hMg';

        if (bwid && shouldCallTailor()) {
            tailor.getSurvey(bwid)
                .then(handleResponse)
                .then(onSurveyAdded);
        };
    }

    return {
        init: init
    }
});
