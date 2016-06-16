define([
    'bean',
    'fastdom',
    'Promise',
    'lodash/functions/debounce',
    'common/utils/config',
    'common/utils/private-browsing',
    'text!common/views/experiments/quick-survey.html'
], function (
    bean,
    fastdom,
    Promise,
    debounce,
    config,
    privateBrowsing,
    quickSurvey
) {
    return function () {
        this.id = 'VisitorFrequencyQuickSurvey';
        this.start = '2016-06-13';
        this.expiry = '2016-06-18';
        this.author = 'Kate Whalen';
        this.description = 'Add a single question survey to the submeta section of article pages';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Obtain a data-set on how often users visit the Guardian';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'impressions frequency survey';
        this.idealOutcome = '';

        this.canRun = function () {
            // only run on articles, for users that have not seen the survey before
            return config.page.contentType == 'Article' && document.cookie.indexOf('GU_FI') == -1;
        };

        function renderQuickSurvey() {
            // this cannot be wrapped in a fastdom function; the disable function breaks
            var insertionPoint = document.getElementById('img-1');
            var survey = document.createElement('div');
            survey.innerHTML = quickSurvey;
            insertionPoint.appendChild(survey);
        }

        function disableRadioButtons(buttonClassName) {
            var radioButtons = document.getElementsByClassName(buttonClassName);
            for (var i = 0; i < radioButtons.length; i++) {
                    radioButtons[i].disabled=true;
                }
        }

        function surveyFadeOut() {
            var surveyTextbox = document.getElementById('surveyTextbox');
            fastdom.write(function () {
                surveyTextbox.style.cssText += 'visibility:hidden;opacity:0;transition:visibility 0s ease-in 0.5s,opacity 0.5s linear';
            });
        }

        function thankyouFadeIn() {
            var surveyThanks = document.getElementsByClassName('impressions-survey__thanks');
            fastdom.write(function () {
                surveyThanks[0].style.cssText += 'visibility:visible;opacity:1;transition:visibility 0s ease-in 0.5s,opacity 0.8s linear';
            });
        }

        function handleSurveyResponse(buttonClassName) {
            var surveyQuestion = document.getElementById('impressions-survey__select');
            bean.on(surveyQuestion, 'click', function () {
                fastdom.write(function () {
                    disableRadioButtons(buttonClassName);
                    surveyFadeOut();
                    thankyouFadeIn();
                });
            });
        }

        function checkBrowsingMode() {
            privateBrowsing.then(function (success) {
                var dataLinkName = 'private-browsing-' + success;
                var surveySelect = document.getElementById('impressions-survey__select');
                surveySelect.setAttribute('data-link-name', dataLinkName);
            });
        }

        function checkVisible(domElement) {
            var rect = domElement.getBoundingClientRect();
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
        }

        function setCookieForSurvey() {
            // give user a cookie to say that they have seen the survey
            // alternatively, only set the cookie on click or interaction (show until answered)?
            window.onscroll = debounce(function () {
                if (checkVisible(document.getElementById('surveyTextbox'))) {
                    document.cookie = 'GU_FI=quick question seen; expires=Fri, 24 Jun 2016 10:30:00 UTC; path=/';
                }
            }, 100);
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    renderQuickSurvey();
                    setCookieForSurvey();
                    handleSurveyResponse('fi-survey__button');
                    checkBrowsingMode();
                }
            }
        ];
    };
});
