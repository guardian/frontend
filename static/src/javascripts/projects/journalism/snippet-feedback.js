// @flow
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import ophan from 'ophan/ng';
import { getViewport } from 'lib/detect';
import { submitComponentEvent } from 'common/modules/commercial/acquisitions-ophan';

const SnippetFeedback = (options: { scroll: boolean } = { scroll: true }) => {
    let snippets = [...document.querySelectorAll('.explainer-snippet--new')];

    const sendOldStyleInteraction = (snippetId, component, value) => {
        ophan.record({
            atomId: snippetId,
            component,
            value,
        });
    };

    const snippetTypeToComponentType = (
        snippetType: string
    ): OphanComponentType => {
        switch (snippetType) {
            case 'guide':
                return 'GUIDE_ATOM';
            case 'timeline':
                return 'TIMELINE_ATOM';
            case 'qanda':
                return 'QANDA_ATOM';
            default:
                return 'PROFILE_ATOM';
        }
    };

    const sendNewStyleInteraction = (
        snippetId: string,
        snippetType: string,
        action: OphanAction
    ) => {
        const componentType: OphanComponentType = snippetTypeToComponentType(
            snippetType
        );

        submitComponentEvent({
            component: {
                componentType,
                id: snippetId,
            },
            action,
        });
    };

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
                sendOldStyleInteraction(
                    snippetId,
                    component,
                    `${snippetType}_feedback_${value}`
                );

                sendNewStyleInteraction(
                    snippetId,
                    snippetType,
                    value === 'like' ? 'LIKE' : 'DISLIKE'
                );

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
                sendOldStyleInteraction(
                    snippetId,
                    component,
                    `${snippetType}_expanded`
                );

                sendNewStyleInteraction(snippetId, snippetType, 'EXPAND');

                e.currentTarget.removeEventListener('click', onExpand);
            });
        }
    });

    if (options.scroll) {
        // Callback for scroll into view
        mediator.on('window:throttledScroll', function onScroll() {
            snippets = snippets.filter(snippet => {
                const height = getViewport().height;
                const coords = snippet.getBoundingClientRect();
                const isInView = coords.top >= 0 && coords.bottom <= height;

                if (isInView) {
                    const { snippetId, snippetType } = snippet.dataset;
                    if (!snippetId || !snippetType) {
                        return false;
                    }
                    const component = `snippet_${snippetType}`;

                    sendOldStyleInteraction(
                        snippetId,
                        component,
                        `${snippetType}_component_in_view`
                    );

                    sendNewStyleInteraction(snippetId, snippetType, 'VIEW');

                    return false;
                }
                return true;
            });

            if (snippets.length === 0) {
                mediator.off('window:throttledScroll', onScroll);
            }
        });
    }
};

export { SnippetFeedback };
