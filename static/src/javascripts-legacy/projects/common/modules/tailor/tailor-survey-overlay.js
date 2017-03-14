define([
    'lib/fastdom-promise',
    'lib/config',
    'lib/detect',
    'lib/cookies',
    'lib/template',
    'lib/storage',
    'common/modules/tailor/tailor',
    'raw-loader!common/views/tailor-survey-overlay.html',
    'common/views/svgs',
    'ophan/ng'
], function(
    fastdomPromise,
    config,
    detect,
    cookies,
    template,
    storage,
    tailor,
    tailorSurveyOverlayTemplate,
    svgs,
    ophan
) {

    var EDITION_CONFIG = {
        default: {
            copy: 'Take part in a survey for the Guardian and win Amazon vouchers',
            url: 'http://sunesis.equinoa.com/1703/BLU/cgi-bin/ciwweb.pl?hid_studyname=BLU&v=c'
        },
        AU: {
            copy: 'We would like you to take part in a short Guardian survey',
            url: 'http://sunesis.equinoa.com/1703/BLUau/cgi-bin/ciwweb.pl?hid_studyname=BLUau&v=c'
        }
    };

    function shouldCallTailor(forceShow) {
        return  !config.page.shouldHideAdverts &&
                !config.page.isSensitive &&
                !config.page.isFront &&
                (!cookies.get('GU_TAILOR_SURVEY_OVERLAY') || forceShow) &&
                detect.getBreakpoint() !== 'mobile';
    }

    function handleResponse(showSurvey) {
        if (showSurvey) {
            return fastdomPromise.write(function () {
                var surveyOverlay = document.createElement('div');

                surveyOverlay.classList.add('tailor-survey-overlay');
                surveyOverlay.dataset.component = 'tailor-survey-overlay';

                surveyOverlay.innerHTML = template(tailorSurveyOverlayTemplate, {
                    headerCopy: getEditionConfigProp('copy'),
                    chevronRight: svgs('chevronRight'),
                    cross: svgs('crossIcon'),
                    marque36icon: svgs('marque36icon')
                });

                document.body.appendChild(surveyOverlay);

                setupButtonClickEvents(surveyOverlay);
            });
        }
    }

    function setupButtonClickEvents(surveyOverlay) {
        var proceedButton = surveyOverlay.querySelector('.tailor-survey-proceed-button');
        var closeButton = surveyOverlay.querySelector('.tailor-survey-close-button');
        var surveyURL = getEditionConfigProp('url');

        if (config.ophan && config.ophan.pageViewId) {
            surveyURL += '&id=' + config.ophan.pageViewId;
        }

        proceedButton.addEventListener('click', function () {
            window.location = surveyURL; 
        });

        closeButton.addEventListener('click', function () {
           surveyOverlay.parentNode.removeChild(surveyOverlay); 
        });
    }

    function getEditionConfigProp(key) {
        if (EDITION_CONFIG[config.page.edition]) {
            return EDITION_CONFIG[config.page.edition][key];
        } else {
            return EDITION_CONFIG['default'][key];
        }
    }

    function onSurveyAdded() {
        ophan.record({
            component: 'tailor-survey-overlay',
            value: 'impression'
        });

        cookies.add('GU_TAILOR_SURVEY_OVERLAY', 1, 100); // do not show this survey to the user for the next 100 days
    }

    function init() {
        var bwid = cookies.get('bwid') || 'Qb6TGfeA6wRVyIkMkm7z9hMg';
        var forceShow = storage.local.get('gu.tailorSurvey.forceShow') || false;

        if (bwid && shouldCallTailor(forceShow)) {
            tailor.getSurvey(bwid, config.page.edition, forceShow)
                .then(handleResponse)
                .then(onSurveyAdded);
        }
    }

    return {
        init: init
    }
});
