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
            var surveyQuestion = "<h3>How often do you read the Guardian in a digital format?</h3>";
            var surveyOptions = `<form id="impressions-survey__select">
  <label><input type="radio" class="fi-survey__button" name="frequency_5" value="frequency_5">Every day/most days</label><br>
  <label><input type="radio" class="fi-survey__button" name="frequency_4" value="frequency_4">Weekly</label><br>
  <label><input type="radio" class="fi-survey__button" name="frequency_3" value="frequency_3">Fortnightly</label><br>
  <label><input type="radio" class="fi-survey__button" name="frequency_2" value="frequency_2">Monthly or less</label><br>
  <label><input type="radio" class="fi-survey__button" name="frequency_1" value="frequency_1">This is my first visit</label><br>
</form>`;

            quickSurvey.id = 'impressions-survey';
            quickSurvey.innerHTML = surveyQuestion + surveyOptions;
            quickSurvey.className += 'submeta__survey';
            quickSurvey.setAttribute('data-link-name', 'frequency survey');
            quickSurvey.style.cssText += 'color:#fff;margin-top:20px;padding: 1em 1em 1em 2.5em;font-size:0.8em;background-color:#005689;';

            submeta.appendChild(quickSurvey);
        }

        function disableRadioButtons(buttonClassName) {
            var radioButtons = document.getElementsByClassName(buttonClassName);
            fastdom.write(function () {
                for (var i = 0; i < radioButtons.length; i++) {
                    radioButtons[i].disabled=true;
                }
            });
        }

        function handleSurveyResponse(element) {
            var optionSelect = document.getElementById('impressions-survey__select');
            bean.on(optionSelect, 'click', function () {
                // disable all the radio buttons
                fastdom.write(function () {
                    disableRadioButtons(element);
                });
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
                    handleSurveyResponse('fi-survey__button');
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
