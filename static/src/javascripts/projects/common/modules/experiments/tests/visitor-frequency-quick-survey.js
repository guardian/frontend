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
        this.start = '2016-06-20';
        this.expiry = '2016-06-24';
        this.author = 'Kate Whalen';
        this.description = 'Add a single question survey to the submeta section of article pages';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Obtain a data-set on how often users visit the Guardian';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'impressions frequency survey';
        this.idealOutcome = '';

        this.canRun = function () {
            return !(config.page.isAdvertisementFeature) &&
                config.page.contentType === 'Article' &&
                isFirstTimeUser('GU_FI');
        };

        function renderQuickSurvey() {
            // this cannot be wrapped in a fastdom function; the disable function breaks
            var article = document.getElementsByClassName('content__article-body')[0];
            var insertionPoint = article.getElementsByTagName('p')[1];
            var surveyDiv = document.createElement('div');
            surveyDiv.innerHTML = quickSurvey;
            article.insertBefore(surveyDiv, insertionPoint);
        }

        function disableRadioButtons(buttonClassName) {
            var radioButtons = document.getElementsByClassName(buttonClassName);
            for (var i = 0; i < radioButtons.length; i++) {
                    radioButtons[i].disabled=true;
                }
        }

        function surveyFadeOut() {
            var surveyContent = document.getElementsByClassName('impressions-survey__content');
            fastdom.write(function () {
                surveyContent[0].classList.add('js-impressions-survey__fadeout');
            });
        }

        function thankyouFadeIn() {
            var surveyThanks = document.getElementsByClassName('impressions-survey__thanks');
            fastdom.write(function () {
                surveyThanks[0].classList.add('js-impressions-survey__fadein');
            });
        }

        function handleSurveyResponse() {
            var surveyQuestion = document.getElementsByClassName('impressions-survey__select');
            bean.on(surveyQuestion[0], 'click', function () {
                fastdom.write(function () {
                    disableRadioButtons('fi-survey__button');
                    surveyFadeOut();
                    thankyouFadeIn();
                });
            });
        }

        function isFirstTimeUser(cookieName) {
            var surveyCookie = cookies.get(cookieName);
            if (!(surveyCookie) && storage.local.isStorageAvailable()) {
                var alreadyVisited = storage.local.get('gu.alreadyVisited');
                return !alreadyVisited || alreadyVisited < 1;
            }
            return false;
        }

        function checkBrowsingMode() {
            privateBrowsing.then(function (success) {
                var browsingMode = 'private-browsing-' + success;
                var surveySelect = document.getElementsByClassName('impressions-survey__select');
                surveySelect[0].setAttribute('data-link-name', browsingMode);
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
