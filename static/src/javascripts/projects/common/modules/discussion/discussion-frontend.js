// @flow

import config from 'lib/config';
import fastdom from 'fastdom';
import { integerCommas } from 'lib/formatters';
import { loadScript } from 'lib/load-script';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import type { Loader } from './loader';

const loadDiscussionFrontend = (
    loader: Loader,
    opts: Object
): Promise<void> => {
    const updateCommentCount = (element: HTMLElement, value: number): void => {
        const formatted = integerCommas(value);

        if (formatted) {
            fastdom.write(() => {
                element.textContent = formatted;
            });
        }
    };

    /* emitter is a different mediator instance than lib/mediator */
    const onDiscussionFrontendLoad = (emitter: mediator): void => {
        emitter.on('error', (feature, error) => {
            reportError(error, { feature: `discussion-${feature}` }, false);
        });

        /* This event is emitted by a separate Preact comment count app, which is
           located in https://github.com/guardian/discussion-frontend */
        emitter.once('comment-count', (value: number): void => {
            if (value === 0) {
                loader.setState('empty');
            } else {
                /* By the time discussion frontent loads, the number of comments
                   might have changed. If there are other comment counts element
                   in the page refresh their value. */
                const otherValues = document.getElementsByClassName(
                    'js_commentcount_actualvalue'
                );

                [...otherValues].forEach(el => {
                    updateCommentCount(el, value);
                });
            }

            mediator.emit('comments-count-loaded');
        });
    };

    const error = (err: Error): void => {
        reportError(err, { feature: 'discussion' });
    };

    const init = (frontend: (opts: Object) => Promise<any>): void => {
        frontend(opts)
            .then(onDiscussionFrontendLoad)
            .catch(error);
    };

    /* - Inject the net module to work around the lack of a global fetch
         It can be removed once all browsers have window.fetch
       - Well, it turns out that fetchJson uses reqwest which sends X-Requested-With
         which is not allowed by Access-Control-Allow-Headers, so don't use reqwest
         until discussion API is fixed
       - Once fixed, or a global fetch is available through a polyfill, one can
         modify discussion-frontend to remove `fetch` polyfill and pass, if needed,
         opts.net = { json: fetchJson } */

    return loadScript(config.get('page.discussionFrontendUrl'))
        .then(() => {
            init(window.guardian.app.discussion);
        })
        .catch(error);
};

export { loadDiscussionFrontend };
