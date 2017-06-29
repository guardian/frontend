// @flow
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import ophan from 'ophan/ng';
import detect from 'lib/detect';

const SnippetFeedback = () => {
    const snippets = document.querySelectorAll('.explainer-snippet--new');

    [].forEach.call(snippets, snippet => {
        const atomId = snippet.getAttribute('data-snippet-id');
        const snippetType = snippet.getAttribute('data-snippet-type');
        if (!atomId || !snippetType) {
            return;
        }
        const component = `snippet_${snippetType}`;

        // Callback for like/dislike
        const onFeedback = e => {
            const question = e.currentTarget;
            const ack = snippet.querySelector('.explainer-snippet__ack');
            if (!(question instanceof HTMLElement)) {
                throw new Error('Flow phantom exception');
            }
            const button =
                e.target instanceof Element && e.target.closest('.button');
            const value =
                button && button instanceof HTMLButtonElement && button.value;

            if (value) {
                const data = {
                    atomId,
                    component,
                    value: `${snippetType}_feedback_${value}`,
                };
                ophan.record(data);
                fastdom.write(() => {
                    ack.hidden = false;
                    question.hidden = true;
                });
                e.currentTarget.removeEventListener('click', onFeedback);
            }
        };

        snippet
            .querySelector('.explainer-snippet__feedback')
            .addEventListener('click', onFeedback);

        // Callback for scroll into view
        mediator.on('window:throttledScroll', function onScroll() {
            const height = detect.getViewport().height;
            const coords = snippet.getBoundingClientRect();
            const isInView = coords.top >= 0 && coords.bottom <= height;

            if (isInView) {
                const data = {
                    atomId,
                    component,
                    value: `${snippetType}_component_in_view`,
                };
                ophan.record(data);

                mediator.off('window:throttledScroll', onScroll);
            }
        });

        // Callback for expand
        const handle = snippet.querySelector('.explainer-snippet__handle');
        if (handle) {
            handle.addEventListener('click', function onExpand(e) {
                const data = {
                    atomId,
                    component,
                    value: `${snippetType}_expanded`,
                };
                ophan.record(data);

                e.currentTarget.removeEventListener('click', onExpand);
            });
        }
    });
};

export { SnippetFeedback };
