// @flow

import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { local as localStorage } from 'lib/storage';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import measureUnderstandingStr
    from 'raw-loader!common/views/experiments/measure-understanding.html';
import { markup as thumb } from 'svg-loader!svgs/icon/thumb.svg';

const MeasureUnderstanding = () => {
    // Test id
    const id = 'MeasureUnderstanding';

    // Ophan survey id
    const component = 'measure_understanding';

    // List of pages the test will run in
    const paths = [
        '/us-news/2017/may/11/justice-department-fbi-documents-trump-russia-hack-clinton-email',
        '/us-news/2017/may/09/james-comey-fbi-fired-donald-trump',
        '/us-news/2017/may/10/theres-nothing-there-white-house-staff-deny-comey-sacking-is-linked-to-russia',
        '/us-news/2017/may/10/terrifying-astonishing-nixonian-james-comeys-termination-by-trump',
        '/us-news/2017/may/11/james-comey-farewell-letter-fbi-independence--sacking-fallout',
        '/us-news/2017/may/09/james-comey-fbi-fired-donald-trump-hillary-clinton-emails',
    ];

    // A heuristic to detect explainers in the article via their dataset.canonicalUrl
    const prefix =
        'https://interactive.guim.co.uk/2016/08/explainer-interactive';

    // Test duration
    const start = '2017-05-11';
    const expiry = '2017-05-18';

    // will run in articles only if no story questions atom is already there
    // *and* the user hasn't already answered the question
    const canRun = () =>
        paths.includes(location.pathname) && !localStorage.get(id);

    // at the click of a button, we send a notification to ophan and clean up
    // registered listeners to prevent duplicate calls
    const onClick = (evt: Event) => {
        // #? Flow will complain if we don't type check
        if (!(evt.target instanceof Element)) {
            throw new Error('This will never happen');
        }
        const button = evt.target.closest('.js-button');
        const value = button && button.getAttribute('data-value');
        if (value) {
            // #? Flow will complain if we don't type check
            if (!(evt.currentTarget instanceof Element)) {
                throw new Error('This will never happen');
            }
            const question = evt.currentTarget;
            const feedback = question.lastElementChild;
            question.removeEventListener('click', onClick);
            fastdom
                .write(() => {
                    question.classList.add('is-answered');
                    [...question.querySelectorAll('.js-button')].forEach(b =>
                        b.setAttribute('hidden', 'hidden')
                    );
                    if (feedback) {
                        feedback.removeAttribute('hidden');
                    }
                })
                .then(() => {
                    localStorage.set(id, true, { expires: Date.parse(expiry) });
                    ophan.record({ component, value });
                    mediator.emit('ab:understanding:complete');
                });
        }
    };

    // test bootstrap: runs when the user is in the corresponding variant
    const test = () => {
        const html = template(measureUnderstandingStr, {
            thumbsUp: thumb,
            thumbsDown: thumb,
        });
        const articleBody = document.getElementsByClassName(
            'js-article__body'
        )[0];
        fastdom
            .write(() => {
                articleBody.insertAdjacentHTML('beforeend', html);
                return articleBody.lastElementChild;
            })
            .then(clicktrap => {
                addEventListener(clicktrap, 'click', onClick);
                mediator.emit('ab:understanding:displayed');
            });
    };

    const testWithout = () => {
        fastdom.write(() => {
            [
                ...document.getElementsByClassName('element-interactive'),
            ].forEach(i => {
                const url = i.getAttribute('data-canonical-url');
                if (url && url.includes(prefix)) {
                    i.hidden = true;
                    i.style.display = 'none';
                }
            });
        });
        test();
    };

    // registers an impression (in our case, when the form is added to the dom)
    const impression = track => {
        mediator.on('ab:understanding:displayed', track);
    };

    // registers a successful test (in our case, when the user answers the question)
    const success = track => {
        mediator.on('ab:understanding:complete', track);
    };

    return Object.freeze({
        id,
        start,
        expiry,
        audience: 1,
        audienceOffset: 0,
        author: 'Nathan',
        description: 'Measure Understanding survey',
        successMeasure: '',
        audienceCriteria: '',
        idealOutcome: "We improve users' understanding of a topic by showing them Explainers",
        canRun,
        showForSensitive: true,
        variants: [
            { id: 'with-explainer', test, impression, success },
            { id: 'without-explainer', test: testWithout, impression, success },
        ],
    });
};

export { MeasureUnderstanding };
