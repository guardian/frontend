// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import config from 'lib/config';
import { getCookie, addCookie, removeCookie } from 'lib/cookies';
import { local } from 'lib/storage';
import mediator from 'lib/mediator';
import tailorSurveyHtml
    from 'raw-loader!common/views/experiments/tailor-survey.html';
import ophan from 'ophan/ng';
import template from 'lodash/utilities/template';
import { fillSpace } from 'common/modules/article/space-filler';
import { getSuggestedSurvey } from 'common/modules/tailor/tailor';

// Every time we show a survey to a user, we cannot show it again to that suer for a specified number of days.
// We store 'surveyId=dayShowAgain' in the cookie, and pass any surveys that cannot currently be shown in the
// call to tailor.
const storeSurveyShowedInCookie = data => {
    const id = data.survey.surveyId;
    const dayCanShowAgain = data.dayCanShowAgain;
    const newCookieValue = `${id}=${dayCanShowAgain}`;
    let currentCookieValues = getCookie('GU_TAILOR_SURVEY');

    if (currentCookieValues) {
        // we've shown surveys already
        currentCookieValues = `${currentCookieValues},${newCookieValue}`;
        removeCookie('GU_TAILOR_SURVEY');
        addCookie('GU_TAILOR_SURVEY', currentCookieValues, 365);
    } else {
        // first time we show any survey
        addCookie('GU_TAILOR_SURVEY', newCookieValue, 365);
    }
};

// We go through the list of surveys that have already been shown to the user, and return a list of survey ids
// that aren't currently allowed to be shown.
const getSurveyIdsNotToShow = () => {
    const currentCookieValues = getCookie('GU_TAILOR_SURVEY');
    const values = currentCookieValues ? currentCookieValues.split(',') : [];
    const isAfterToday = cookieValue => {
        const date = cookieValue.split('=')[1];

        return new Date(date).valueOf() > new Date().valueOf();
    };
    const surveysWeCannotShow = values.filter(isAfterToday);

    return surveysWeCannotShow
        .map(idAndDate => idAndDate.split('=')[0])
        .toString();
};

// Getting simple json from tailor's reponse to be passed to the html template
const getJsonFromSurvey = survey => ({
    question: survey.question,
    id: survey.surveyId,
});

// Rules to use when finding a space for the survey
const spacefinderRules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 0,
    minBelow: 0,
    clearContentMeta: 50,
    selectors: {
        ' .element-rich-link': {
            minAbove: 100,
            minBelow: 100,
        },
        ' .element-image': {
            minAbove: 50,
            minBelow: 50,
        },
        ' .player': {
            minAbove: 0,
            minBelow: 0,
        },
        ' > h1': {
            minAbove: 0,
            minBelow: 0,
        },
        ' > h2': {
            minAbove: 0,
            minBelow: 0,
        },
        ' > *:not(p):not(h2):not(blockquote)': {
            minAbove: 0,
            minBelow: 0,
        },
        ' .ad-slot': {
            minAbove: 100,
            minBelow: 100,
        },
    },
};

// we can write a survey into a spare space using spaceFiller
const inArticleWriter = (survey, surveyId) =>
    fillSpace(spacefinderRules, paras => {
        const componentName = `data_tailor_survey_${surveyId}`;

        mediator.emit('register:begin', componentName);
        bonzo(survey).insertBefore(paras[0]);
        mediator.emit('register:end', componentName);

        return surveyId;
    });

// the main function to render the survey
const renderQuickSurvey = () => {
    const queryParams = {};

    queryParams.edition = config.page.edition;

    // If we want to force tailor to show a particular survey we can set an attribute in local storage to have
    // key = 'surveyToShow', and value = the survey id. Tailor will then override other logic for display, and
    // look for a survey with this ID to return. This is useful as we can easily see how a particular survey
    // would be rendered, without actually putting it live. If this parameter is empty or not specified, tailor
    // behaves as usual.
    const surveyToShow = local.get('surveyToShow');

    if (surveyToShow) {
        queryParams.surveyToShow = surveyToShow;
    }

    // get the list of surveys that can't be shown as they have been shown recently
    const surveysNotToShow = getSurveyIdsNotToShow();

    if (surveysNotToShow) {
        queryParams.surveysNotToShow = surveysNotToShow;
    }

    return getSuggestedSurvey(queryParams).then(suggestion => {
        if (suggestion) {
            storeSurveyShowedInCookie(suggestion.data);

            const json = getJsonFromSurvey(suggestion.data.survey);
            const survey = bonzo.create(template(tailorSurveyHtml, json));

            return inArticleWriter(survey, suggestion.data.survey.surveyId);
        }
        Promise.resolve();
    });
};

const disableRadioButtons = buttonClassName => {
    const radioButtons = document.getElementsByClassName(buttonClassName);

    [...radioButtons].forEach((button: any) => {
        const radio: HTMLInputElement = button;

        radio.disabled = true;
    });
};

const surveyFadeOut = () => {
    const surveyContent = document.getElementsByClassName(
        'impressions-survey__content'
    );

    [...surveyContent].forEach(content => {
        content.classList.add('js-impressions-survey__fadeout');
    });
};

const thankyouFadeIn = () => {
    const surveyThanks = document.getElementsByClassName(
        'impressions-survey__thanks'
    );

    [...surveyThanks].forEach(thanks => {
        thanks.classList.add('js-impressions-survey__fadein');
    });
};

const recordOphanAbEvent = (answer, surveyId) => {
    const componentId = `data_tailor_survey_${surveyId}`;

    ophan.record({
        component: componentId,
        value: answer,
    });
};

const handleSurveyResponse = surveyId => {
    const surveyQuestions = [
        ...document.getElementsByClassName('fi-survey__button'),
    ];

    surveyQuestions.forEach(question => {
        // #? use addEventListener
        bean.on(question, 'click', event => {
            if (event.target.attributes.getNamedItem('data-link-name')) {
                const answer = event.target.attributes.getNamedItem(
                    'data-link-name'
                ).value;

                recordOphanAbEvent(answer, surveyId);

                mediator.emit('tailor:survey:clicked');
                fastdom.write(() => {
                    disableRadioButtons('fi-survey__button');
                    surveyFadeOut();
                    thankyouFadeIn();
                });
            }
        });
    });
};

export const tailorSurvey: ABTest = {
    id: 'TailorSurvey',
    start: '2017-03-07',
    expiry: '2017-08-31',
    author: 'Manlio & Mike',
    description: 'Testing Tailor',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'We can show a survey on Frontend as decided by Tailor',
    audienceCriteria: 'All users',
    dataLinkNames: 'Tailor survey',
    canRun: () =>
        !config.page.isAdvertisementFeature &&
        config.page.contentType === 'Article',
    variants: [
        {
            id: 'control',
            test: () => {},
        },

        {
            id: 'variant',
            test: () => {
                renderQuickSurvey().then(surveyId => {
                    if (surveyId) {
                        mediator.emit('survey-added');
                        handleSurveyResponse(surveyId);
                    }
                });
            },
            impression: track => {
                mediator.on('survey-added', track);
            },
            success: complete => {
                mediator.on('tailor:survey:clicked', complete);
            },
        },
    ],
};
