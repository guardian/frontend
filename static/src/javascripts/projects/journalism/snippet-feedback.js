// @flow
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import ophan from 'ophan/ng';
import detect from 'lib/detect';

const SnippetFeedback = (): void => {
    let snippets = [...document.querySelectorAll('.explainer-snippet--new')];

    snippets.forEach(snippet => {
        const { snippetId, snippetType } = snippet.dataset;
        if (!snippetId || !snippetType) {
            return;
        }
        const component = `snippet_${snippetType}`;

        // Callback for like/dislike
        const onFeedback = (e: Event) => {
            const question: HTMLElement = (e.currentTarget: any);
            const ack: ?HTMLElement = (snippet.querySelector(
                '.explainer-snippet__ack'
            ): ?any);

            const button =
                e.target instanceof Element && e.target.closest('.button');
            const value =
                button && button instanceof HTMLButtonElement && button.value;

            if (value && ack) {
                const data = {
                    atomId: snippetId,
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

        const feedback: ?Element = snippet.querySelector(
            '.explainer-snippet__feedback'
        );
        if (feedback) {
            feedback.addEventListener('click', onFeedback);
        }

        // Callback for expand
        const handle: ?Element = snippet.querySelector(
            '.explainer-snippet__handle'
        );
        if (handle) {
            handle.addEventListener('click', function onExpand(e: Event) {
                const data = {
                    atomId: snippetId,
                    component,
                    value: `${snippetType}_expanded`,
                };
                ophan.record(data);

                e.currentTarget.removeEventListener('click', onExpand);
            });
        }
    });

    // Callback for scroll into view
    mediator.on('window:throttledScroll', function onScroll() {
        snippets = snippets.filter(snippet => {
            const height = detect.getViewport().height;
            const coords = snippet.getBoundingClientRect();
            const isInView = coords.top >= 0 && coords.bottom <= height;

            if (isInView) {
                const { snippetId, snippetType } = snippet.dataset;
                if (!snippetId || !snippetType) {
                    return false;
                }
                const component = `snippet_${snippetType}`;

                const data = {
                    atomId: snippetId,
                    component,
                    value: `${snippetType}_component_in_view`,
                };
                ophan.record(data);

                return false;
            }
            return true;
        });

        if (snippets.length === 0) {
            mediator.off('window:throttledScroll', onScroll);
        }
    });
};

export { SnippetFeedback };
