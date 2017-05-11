// @flow

/* eslint no-param-reassign: "off" */

import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { local as localStorage } from 'lib/storage';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import ExplainerSnippetStr
    from 'raw-loader!common/views/experiments/explainer.html';
import { markup as thumbIcon } from 'svg-loader!svgs/icon/thumb.svg';
import { markup as plusIcon } from 'svg-loader!svgs/icon/plus.svg';
import { markup as minusIcon } from 'svg-loader!svgs/icon/minus.svg';

const ExplainerSnippet = () => {
    // Test id
    const id = 'ExplainerSnippet';

    // Ophan survey id
    const componentPrefix = 'explainer_feedback__';

    // List of pages the test will run in
    const paths = [
        '/sport/2017/may/11/alternative-national-anthem-planned-during-nrls-indigenous-round',
    ];

    // Test duration
    const start = '2017-05-11';
    const expiry = '2017-05-18';

    // will run in articles only if no story questions atom is already there
    // *and* the user hasn't already answered the question
    const canRun = () =>
        paths.includes(location.pathname) && !localStorage.get(id);

    // at the click of a button, we send a notification to ophan and clean up
    // registered listeners to prevent duplicate calls
    const onShow = () => {
        mediator.emit('ab:explainer:complete');
    };

    const onFeedback = (ack: HTMLElement, eid: string, e: Event) => {
        const question = e.currentTarget;
        if (!(question instanceof HTMLElement)) {
            throw new Error('Flow phantom exception');
        }
        const button =
            e.target instanceof Element && e.target.closest('.button');
        const value =
            button && button instanceof HTMLButtonElement && button.value;
        if (value) {
            ophan.record({
                component: componentPrefix + eid,
                value,
            });
            fastdom.write(() => {
                ack.hidden = false;
                question.hidden = true;
            });
        }
    };

    // test bootstrap: runs when the user is in the corresponding variant
    const test = () => {
        const hook = document.querySelector('.js-explainer');
        if (hook) {
            const html = template(ExplainerSnippetStr, {
                thumbIcon,
                plusIcon,
                minusIcon,
                style: Math.random() < 0.5 ? 'light' : 'dark',
            });
            fastdom
                .write(() => {
                    hook.insertAdjacentHTML('beforeend', html);
                    return [
                        ...hook.querySelectorAll(
                            '.explainer__header, .explainer__feedback, .explainer__ack'
                        ),
                    ];
                })
                .then(([handle, question, ack]) => {
                    const eid = hook.getAttribute('data-explainer-id') || '';
                    addEventListener(handle, 'click', onShow, { once: true });
                    addEventListener(
                        question,
                        'click',
                        onFeedback.bind(null, ack, eid)
                    );
                    mediator.emit('ab:explainer:displayed');
                });
        }
    };

    // registers an impression (in our case, when the form is added to the dom)
    const impression = track => {
        mediator.on('ab:explainer:displayed', track);
    };

    // registers a successful test (in our case, when the user answers the question)
    const success = track => {
        mediator.on('ab:explainer:complete', track);
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
        variants: [{ id: 'snippet', test, impression, success }],
    });
};

export { ExplainerSnippet };
