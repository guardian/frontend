// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import config from 'lib/config';
import { getCookie, addCookie, removeCookie } from 'lib/cookies';
import mediator from 'lib/mediator';
import tailorSurveyHtml from 'raw-loader!common/views/experiments/tailor-survey.html';
import ophan from 'ophan/ng';
import template from 'lodash/utilities/template';
import { spaceFiller } from 'common/modules/article/space-filler';
import { getSurvey } from 'common/modules/tailor/tailor';

// Every time we show a survey to a user, we cannot show it again to that user for a specified number of days.
// We store 'surveyId=dayShowAgain' in the cookie, and pass any surveys that cannot currently be shown in the
// call to tailor.
const storeSurveyShowedInCookie = survey => {
    const newCookieValue = `${survey.id}=${survey.dayCanShowAgain}`;
    let currentCookieValues = getCookie('GU_TAILOR_SURVEY');

    if (currentCookieValues) {
        // we've shown surveys already
        if (!currentCookieValues.split(',').includes(newCookieValue)) {
            // new cookie value, add it to the list
            currentCookieValues = `${currentCookieValues},${newCookieValue}`;
        }
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
    spaceFiller.fillSpace(spacefinderRules, paras => {
        const componentName = `data_tailor_survey_${surveyId}`;

        mediator.emit('register:begin', componentName);
        bonzo(survey).insertBefore(paras[0]);
        mediator.emit('register:end', componentName);

        return surveyId;
    });

// Getting simple json from tailor's response to be passed to the html template
const getJsonFromSurvey = ({ question, id }) => ({ question, id });

// the main function to render the survey
const renderQuickSurvey = () => {
    const queryParams = {};

    queryParams.edition = config.page.edition;

    // If we want to force tailor to show a particular survey we can set an attribute in local storage to have
    // key = 'surveyToShow', and value = the survey id. Tailor will then override other logic for display, and
    // look for a survey with this ID to return. This is useful as we can easily see how a particular survey
    // would be rendered, without actually putting it live. If this parameter is empty or not specified, tailor
    // behaves as usual.

    const surveyToShow = window.localStorage
        ? window.localStorage.surveyToShow
        : [];

    if (surveyToShow) {
        queryParams.force = surveyToShow;
    }

    // get the list of surveys that can't be shown as they have been shown recently
    const surveysNotToShow = getSurveyIdsNotToShow();

    if (surveysNotToShow) {
        queryParams.hide = surveysNotToShow;
    }

    return getSurvey(queryParams).then(s => {
        if (s) {
            storeSurveyShowedInCookie(s);

            const survey = bonzo.create(
                template(tailorSurveyHtml, getJsonFromSurvey(s))
            );

            return inArticleWriter(survey, s.id);
        }
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
    const componentId = `new_tailor_survey_${surveyId}`;

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
