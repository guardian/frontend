import { addEventListener } from 'lib/events';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { local as localStorage } from 'lib/storage';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import measureUnderstandingStr from 'raw-loader!common/views/experiments/measure-understanding.html';
import { markup as thumb } from 'svg-loader!svgs/icon/thumb.svg';

const MeasureUnderstanding = () => {
    // Test id
    const id = 'MeasureUnderstanding';

    // Ophan survey id
    const component = 'data_survey_1234';

    // will run in articles only if no story questions atom is already there
    // *and* the user hasn't already answered the question
    const canRun = () => {
        return config.page.contentType === 'Article'
            && !config.page.isAdvertisementFeature
            && !localStorage.get(id)
            && !document.getElementsByClassName('js-view-tracking-component').length;
    }

    // at the click of a button, we send a notification to ophan and clean up
    // registered listeners to prevent duplicate calls
    const onClick = (evt) => {
        const button = evt.target.closest('.js-button');
        const value = button && button.getAttribute('data-value');
        if (value) {
            const question = evt.currentTarget;
            const feedback = question.lastElementChild;
            question.removeEventListener('click', onClick);
            fastdom.write(() => {
                question.classList.add('is-answered');
                Array
                  .from(question.querySelectorAll('.js-button'))
                  .forEach(b => b.setAttribute('hidden', 'hidden'))
                feedback.removeAttribute('hidden');
            })
            .then(() => {
                localStorage.set(id, true);
                ophan.record({ component, value });
                mediator.emit('ab:understanding:complete');
            });
        }
    }

    // test bootstrap: runs when the user is in the corresponding variant
    const test = () => {
        const html = template(measureUnderstandingStr, { thumbsUp: thumb, thumbsDown: thumb });
        const articleBody = document.getElementsByClassName('js-article__body')[0];
        fastdom.write(() => {
            articleBody.insertAdjacentHTML('beforeend', html);
            return articleBody.lastElementChild;
        })
        .then(clicktrap => {
            addEventListener(clicktrap, 'click', onClick);
            mediator.emit('ab:understanding:displayed');
        });
    };

    // registers an impression (in our case, when the form is added to the dom)
    const impression = track => {
        mediator.on('ab:understanding:displayed', track);
    }

    // registers a successful test (in our case, when the user answers the question)
    const success = track => {
        mediator.on('ab:understanding:complete', track);
    }

    return Object.freeze({
        id,
        start              : '2017-04-27',
        expiry             : '2017-05-27',
        audience           : .5,
        audienceOffset     : 0,
        author             : 'Ela',
        description        : 'Measure Understanding survey',
        successMeasure     : '',
        audienceCriteria   : '',
        idealOutcome       : 'We improve users\' understanding of a topic by showing them Explainers',
        canRun             : canRun,
        showForSensitive   : true,
        variants           : [
            { id: 'survey', test, impression, success }
        ]
    });
}

export { MeasureUnderstanding };
