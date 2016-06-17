define([
    'bean',
    'fastdom',
    'lodash/functions/debounce',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/storage',
    'common/utils/private-browsing',
    'text!common/views/experiments/quick-survey.html'
], function (
    bean,
    fastdom,
    debounce,
    config,
    cookies,
    storage,
    privateBrowsing,
    quickSurvey
) {
    return function () {
        this.id = 'VisitorFrequencyQuickSurvey';
        this.start = '2016-06-13';
        this.expiry = '2016-06-21';
        this.author = 'Kate Whalen';
        this.description = 'Add a single question survey to the submeta section of article pages';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Obtain a data-set on how often users visit the Guardian';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'impressions frequency survey';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.contentType == 'Article' && checkCookies('GU_FI');
        };

        function renderQuickSurvey() {
            // this cannot be wrapped in a fastdom function; the disable function breaks
            var article = document.getElementsByClassName('content__article-body')[0];
            var firstChild = article.firstChild;
            var survey = document.createElement('div');
            survey.innerHTML = quickSurvey;
            article.insertBefore(survey, firstChild);
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

        function handleSurveyResponse() {
            var surveyQuestion = document.getElementById('impressions-survey__select');
            bean.on(surveyQuestion, 'click', function () {
                fastdom.write(function () {
                    disableRadioButtons('fi-survey__button');
                    surveyFadeOut();
                    thankyouFadeIn();
                });
            });
        }

        function checkCookies(cookieName) {
            var surveyCookie = cookies.get(cookieName);
            if (!(surveyCookie) && storage.local.isStorageAvailable()) {
                var alreadyVisited = storage.local.get('gu.alreadyVisited');
                if (!alreadyVisited || alreadyVisited < 1) {
                    return true;
                }
            }
        }

        function checkBrowsingMode() {
            privateBrowsing.then(function (success) {
                var dataLinkName = 'private-browsing-' + success;
                var surveySelect = document.getElementById('impressions-survey__select');
                surveySelect.setAttribute('data-link-name', dataLinkName);
            });
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    renderQuickSurvey();
                    handleSurveyResponse();
                    checkBrowsingMode();
                    cookies.add('GU_FI', 1, 5);
                }
            }
        ];
    };
});
