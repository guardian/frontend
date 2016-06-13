define([
    'bean',
    'fastdom',
    'common/utils/config'
], function (
    bean,
    fastdom,
    config
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
            return config.page.contentType == 'Article';
            // check for the cookie related to this survey
        };

        function createQuickSurvey() {
            var submeta = document.getElementsByClassName('submeta')[0];
            var quickSurvey = document.createElement('div');
            var surveyQuestion = "<p>How often do you read the Guardian in a digital format?</p>";
            var surveyOptions = '<form><input type="radio" class="fi-survey__button" name="frequency" value="frequency_5">Every day/most days<br><input type="radio" class="fi-survey__button" name="frequency" value="frequency_4">Weekly<br><input type="radio" class="fi-survey__button" name="frequency" value="frequency_3">Fortnightly<br><input type="radio" class="fi-survey__button" name="frequency" value="frequency_2">Monthly or less<br><input type="radio" class="fi-survey__button" name="frequency" value="frequency_1">This is my first visit</form>';

            quickSurvey.id = 'impressions-survey';
            quickSurvey.innerHTML = surveyQuestion + surveyOptions;
            quickSurvey.className += 'submeta__survey';
            quickSurvey.setAttribute('data-link-name', 'frequency survey');
            quickSurvey.style.marginTop = '20px';

            submeta.appendChild(quickSurvey);
        }

        function disableAfterClick(buttonClassName) {
            var radioButtons = document.getElementsByClassName(buttonClassName);
            bean.on(document.getElementById('impressions-survey'), 'click', function () {
                // disable all the radio buttons
                fastdom.write(function () {
                    for (var i = 0; i < radioButtons.length; i++) {
                        radioButtons[i].disabled=true;
                    }
                });
                // TODO: say thank you
            });
        }

        function thankyouFadeIn() {
            // say thank you when the user responds to the survey
        }

        function setCookieForSurvey() {
            // give user a cookie to say that they have responded
            // if user has this cookie then do not show the survey again
        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    console.log("INVARIANT");
                    createQuickSurvey();
                    disableAfterClick('fi-survey__button');
                }
            },
            {
                id: 'control',
                test: function () {
                    console.log("INCONTROL");
                }
            }
        ];
    };
});
