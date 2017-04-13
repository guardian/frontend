define([
    'bean',
    'bonzo',
    'fastdom',
    'Promise',
    'lodash/functions/debounce',
    'lib/config',
    'lib/cookies',
    'lib/storage',
    'lib/mediator',
    'lib/fastdom-promise',
    'raw-loader!common/views/experiments/tailor-survey.html',
    'lodash/collections/forEach',
    'ophan/ng',
    'lodash/utilities/template',
    'common/modules/article/space-filler',
    'common/modules/tailor/tailor'
], function (
    bean,
    bonzo,
    fastdom,
    Promise,
    debounce,
    config,
    cookies,
    storage,
    mediator,
    fastdomPromise,
    tailorSurvey,
    forEach,
    ophan,
    template,
    spaceFiller,
    tailor
) {
    return function () {
        this.id = 'TailorSurvey';
        this.start = '2017-03-07';
        this.expiry = '2017-04-28';
        this.author = 'Manlio & Mahana';
        this.description = 'Testing Tailor surveys';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We can show a survey on Frontend as decided by Tailor';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'Tailor survey';
        this.idealOutcome = '';
        this.canRun = function () {
            return !(config.page.isAdvertisementFeature) &&
                config.page.contentType === 'Article'
        };

        // Every time we show a survey to a user, we cannot show it again to that suer for a specified number of days.
        // We store 'surveyId=dayShowAgain' in the cookie, and pass any surveys that cannot currently be shown in the
        // call to tailor.
        function storeSurveyShowedInCookie(data) {
            var id = data.survey.surveyId;
            var dayCanShowAgain = data.dayCanShowAgain;

            var newCookieValue = id + '=' + dayCanShowAgain;

            var currentCookieValues = cookies.get('GU_TAILOR_SURVEY');

            if (currentCookieValues) {
                // we've shown surveys already
                currentCookieValues = currentCookieValues + ',' + newCookieValue;
                cookies.remove('GU_TAILOR_SURVEY');
                cookies.add('GU_TAILOR_SURVEY', currentCookieValues, 365);
            }
            else {
                // first time we show any survey
                cookies.add('GU_TAILOR_SURVEY', newCookieValue, 365);
            }
        }
        // Given a response from tailor, we see if the response has a survey suggestion, and if so return the first
        // survey suggestion (there should only ever be one, but just in case).
        function getSurveySuggestionToShow(response) {
            if (response.suggestions) {
                var surveySuggestions = response.suggestions.filter(function (suggestion) {
                    return suggestion.class === 'SurveySuggestion';
                });

                if (surveySuggestions.length > 0) {
                    return surveySuggestions[0];
                }
            }
        }

        // We go through the list of surveys that have already been shown to the user, and return a list of survey ids
        // that aren't currently allowed to be shown.
        function getSurveyIdsNotToShow() {
            var currentCookieValues = cookies.get('GU_TAILOR_SURVEY');

            var values = currentCookieValues ? currentCookieValues.split(',') : [];

            var isAfterToday = function (cookieValue) {
                var date = cookieValue.split('=')[1];
                return new Date(date).valueOf() > new Date().valueOf();
            };

            var surveysWeCannotShow = values.filter(isAfterToday);

            return surveysWeCannotShow.map(function (idAndDate) {
                return idAndDate.split('=')[0];
            }).toString();
        }

        // Getting simple json from tailor's reponse to be passed to the html template
        function getJsonFromSurvey(survey) {
            return {
                question : survey.question,
                id : survey.surveyId
            };
        }

        // Rules to use when finding a space for the survey
        var spacefinderRules =
             {
                bodySelector: '.js-article__body',
                slotSelector: ' > p',
                minAbove: 0,
                minBelow: 0,
                clearContentMeta: 50,
                selectors: {
                    ' .element-rich-link': {minAbove: 100, minBelow: 100},
                    ' .element-image': {minAbove: 50, minBelow: 50},
                    ' .player': {minAbove: 0, minBelow: 0},
                    ' > h1': {minAbove: 0, minBelow: 0},
                    ' > h2': {minAbove: 0, minBelow: 0},
                    ' > *:not(p):not(h2):not(blockquote)': {minAbove: 0, minBelow: 0},
                    ' .ad-slot': {minAbove: 100, minBelow: 100}
                }
            };


        // we can write a survey into a spare space using spaceFiller
        var inArticleWriter = function (survey, surveyId) {
            return spaceFiller.fillSpace(spacefinderRules, function (paras) {
                var componentName = 'data_tailor_survey_' + surveyId;
                mediator.emit('register:begin', componentName);
                bonzo(survey).insertBefore(paras[0]);
                mediator.emit('register:end', componentName);
                return surveyId;
            });
        };

        // the main function to render the survey
        function renderQuickSurvey() {
            var queryParams = {
                edition: config.page.edition,
            };

            // If we want to force tailor to show a particular survey we can set an attribute in local storage to have
            // key = 'surveyToShow', and value = the survey id. Tailor will then override other logic for display, and
            // look for a survey with this ID to return. This is useful as we can easily see how a particular survey
            // would be rendered, without actually putting it live. If this parameter is empty or not specified, tailor
            // behaves as usual.
            var surveyToShow = storage.local.get('surveyToShow');

            if (surveyToShow) {
                queryParams.surveyToShow = surveyToShow;
            }

            // get the list of surveys that can't be shown as they have been shown recently
            var surveysNotToShow = getSurveyIdsNotToShow();

            if (surveysNotToShow) {
                queryParams.surveysNotToShow = surveysNotToShow;
            }

            return tailor.fetchData('suggestions', true, queryParams).then(function (suggestions) {
                // get the survey to show
                var surveySuggestionToShow = getSurveySuggestionToShow(suggestions);

                if (surveySuggestionToShow) {
                    storeSurveyShowedInCookie(surveySuggestionToShow.data);

                    var json = getJsonFromSurvey(surveySuggestionToShow.data.survey);

                    var survey = bonzo.create(template(tailorSurvey, json));

                    return inArticleWriter(survey, surveySuggestionToShow.data.survey.surveyId);
                } else {
                    Promise.resolve();
                }
            });
        }

        function disableRadioButtons(buttonClassName) {
            var radioButtons = document.getElementsByClassName(buttonClassName);
            bonzo(radioButtons).each(function (button) {
                button.disabled = true;
            });
        }

        function surveyFadeOut() {
            var surveyContent = document.getElementsByClassName('impressions-survey__content');
            surveyContent[0].classList.add('js-impressions-survey__fadeout');
        }

        function thankyouFadeIn() {
            var surveyThanks = document.getElementsByClassName('impressions-survey__thanks');
            surveyThanks[0].classList.add('js-impressions-survey__fadein');
        }

        function handleSurveyResponse(surveyId) {
            var surveyQuestions = document.getElementsByClassName('fi-survey__button');

            forEach(surveyQuestions, function (question) {
                bean.on(question, 'click', function (event) {
                    if (event.target.attributes.getNamedItem("data-link-name")) {
                        var answer = event.target.attributes.getNamedItem("data-link-name").value;
                        recordOphanAbEvent(answer, surveyId);

                        mediator.emit('tailor:survey:clicked');
                        fastdom.write(function () {
                            disableRadioButtons('fi-survey__button');
                            surveyFadeOut();
                            thankyouFadeIn();
                        });
                    }
                });
            }
            );
        }

        function recordOphanAbEvent(answer, surveyId) {
            var componentId = 'data_tailor_survey_' + surveyId;
            ophan.record({
                component: componentId,
                value: answer
            });
        }

        this.variants = [
            {
                id: 'control',
                test: function () {
                }
            },
            {
                id: 'variant',
                test: function () {
                    renderQuickSurvey().then(function (surveyId) {
                        if (surveyId) {
                            mediator.emit('survey-added');
                            handleSurveyResponse(surveyId);
                        }
                    });
                },
                impression: function (track) {
                    mediator.on('survey-added', track);
                },
                success: function (complete) {
                    mediator.on('tailor:survey:clicked', complete);
                }
            }
        ];
    };
});
