// @flow

import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import ExplainerSnippetStr
    from 'raw-loader!common/views/experiments/explainer.html';
import { markup as thumbIcon } from 'svgs/icon/thumb.svg';
import { markup as plusIcon } from 'svgs/icon/plus.svg';
import { markup as minusIcon } from 'svgs/icon/minus.svg';

const htmlDecode = (input: string): string => {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc && doc.documentElement ? doc.documentElement.textContent : '';
};

const ExplainerSnippet = () => {
    // Test id
    const id = 'ExplainerSnippet';

    // Ophan prefix id
    const componentPrefix = 'explainer_feedback__';

    // Test duration
    const start = '2017-05-18';
    const expiry = '2017-06-13';

    // will run in specific articles
    const canRun = (): boolean =>
        !!document.querySelector('.js-explainer-snippet');

    // opening the disclosure widget is our impression criterion for this test
    const onShow = () => {
        mediator.emit('ab:explainer:displayed');
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
            if (value === 'like') {
                mediator.emit('ab:explainer:complete');
            }
        }
    };

    // test bootstrap: runs when the user is in the corresponding variant
    const test = (options: Object) => {
        const hook = document.querySelector('.js-explainer-snippet');
        const explainer = hook && hook.previousElementSibling;
        const eid = hook && hook.getAttribute('data-explainer-id');
        if (!hook || !explainer || !eid) {
            return;
        }

        const [title: string, body: string] = [
            hook.querySelector('meta[name="explainer-title"]'),
            hook.querySelector('meta[name="explainer-body"]'),
        ].map(
            (el: ?Element) =>
                (el && el instanceof HTMLMetaElement && el.content) || ''
        );

        const html = template(ExplainerSnippetStr, {
            thumbIcon,
            plusIcon,
            minusIcon,
            style: options.style,
            title,
            body: htmlDecode(body),
        });
        fastdom
            .write(() => {
                explainer.setAttribute('hidden', 'hidden');
                hook.insertAdjacentHTML('beforeend', html);
                return [
                    ...hook.querySelectorAll(
                        '.explainer-snippet__header, .explainer-snippet__feedback, .explainer-snippet__ack'
                    ),
                ];
            })
            .then(([handle, question, ack]) => {
                addEventListener(handle, 'click', onShow, { once: true });
                addEventListener(
                    question,
                    'click',
                    (feedback = onFeedback.bind(null, ack, options.style, eid))
                );
            });
    };

    // the "no-snippet" variant piggybacks on the existing interactive
    // and so we don't track impression or success events for this one
    // it is supposed to be done already elsewhere
    const testNoSnippet = () => {
        mediator.emit('ab:explainer:notdisplayed');
    };

    // registers an impression (in our case, when the form is added to the dom)
    const impression = track => {
        mediator.on('ab:explainer:displayed', track);
    };

    // registers an impression (in our case, when the form is added to the dom)
    const impressionNoSnippet = track => {
        mediator.on('ab:explainer:notdisplayed', track);
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
                id: 'no-snippet',
                test: testNoSnippet,
                impression: impressionNoSnippet,
            },
            {
                id: 'control',
                test,
                impression,
                success,
                options: { style: 'light' },
            },
            {
                id: 'snippet-dark',
                test,
                impression,
                success,
                options: { style: 'dark' },
            },
        ],
    });
};

export { ExplainerSnippet };
