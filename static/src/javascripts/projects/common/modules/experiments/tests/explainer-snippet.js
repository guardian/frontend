// @flow

/* eslint no-param-reassign: "off" */

import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import ExplainerSnippetStr
    from 'raw-loader!common/views/experiments/explainer.html';
import thumbIcon from 'svgs/icon/thumb.svg';
import plusIcon from 'svgs/icon/plus.svg';
import minusIcon from 'svgs/icon/minus.svg';

const ExplainerSnippet = () => {
    // Test id
    const id = 'ExplainerSnippet';

    // Ophan prefix id
    const componentPrefix = 'explainer_feedback__';

    // List of pages the test will run in
    const paths = [
        '/sport/2017/may/11/alternative-national-anthem-planned-during-nrls-indigenous-round',
    ];

    // Test duration
    const start = '2017-05-11';
    const expiry = '2017-05-18';

    // will run in specific articles
    const canRun = () => paths.includes(location.pathname);

    // opening the disclosure widget is our success criterion for this test
    const onShow = () => {
        mediator.emit('ab:explainer:complete');
    };

    // we'll bind a partial function to listen for thumbs up/down events
    let feedback;

    const onFeedback = (
        ack: HTMLElement,
        style: string,
        eid: string,
        e: Event
    ) => {
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
                style,
                value,
            });
            fastdom.write(() => {
                ack.hidden = false;
                question.hidden = true;
            });
            e.currentTarget.removeEventListener('click', feedback);
        }
    };

    // test bootstrap: runs when the user is in the corresponding variant
    const test = (options: Object) => {
        const hook = document.querySelector('.js-explainer-snippet');
        if (hook) {
            const html = template(ExplainerSnippetStr, {
                thumbIcon,
                plusIcon,
                minusIcon,
                style: options.style,
            });
            fastdom
                .write(() => {
                    hook.insertAdjacentHTML('beforeend', html);
                    return [
                        ...hook.querySelectorAll(
                            '.explainer-snippet__header, .explainer-snippet__feedback, .explainer-snippet__ack'
                        ),
                    ];
                })
                .then(([handle, question, ack]) => {
                    const eid = hook.getAttribute('data-explainer-id') || '';
                    addEventListener(handle, 'click', onShow, { once: true });
                    addEventListener(
                        question,
                        'click',
                        (feedback = onFeedback.bind(
                            null,
                            ack,
                            options.style,
                            eid
                        ))
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
        variants: [
            {
                id: 'snippet',
                test,
                impression,
                success,
                options: { style: 'light' },
            },
            {
                id: 'snippet',
                test,
                impression,
                success,
                options: { style: 'dark' },
            },
        ],
    });
};

export { ExplainerSnippet };
