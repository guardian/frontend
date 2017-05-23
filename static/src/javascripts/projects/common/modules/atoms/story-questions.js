// @flow
import fastdom from 'fastdom';
import mediator from 'lib/mediator';
import detect from 'lib/detect';
import ophan from 'ophan/ng';

const askQuestion = (event: Event): void => {
    event.preventDefault();
    if (!(event.currentTarget instanceof Element)) {
        return;
    }
    const questionElement: ?Element = event.currentTarget.querySelector(
        '.user__question-upvote'
    );
    const atomIdElement: ?Element = document.querySelector(
        '.js-storyquestion-atom-id'
    );

    if (!questionElement || !atomIdElement) {
        return;
    }

    const questionId = questionElement.id;
    const atomId = atomIdElement.getAttribute('id');

    const question: ?Element = document.querySelector(`meta[name=js-notranslate-${questionId}]`);
    if (!question || !(question instanceof HTMLMetaElement)) {
        return;
    }

    const questionElementClicked: ?Element = document.getElementById(
        questionId
    );
    const thankYouMessage: ?Element = document.getElementById(`js-question-thankyou-${questionId}`);

    if (questionElementClicked && thankYouMessage) {
        fastdom.write(() => {
            questionElementClicked.classList.add('is-hidden');
            thankYouMessage.classList.remove('is-hidden');
        });
    }

    ophan.record({
        atomId,
        component: question.content.trim(),
        value: 'question_asked',
    });
};

const init = () => {
    const askQuestionLinks: Array<Element> = [
        ...document.getElementsByClassName('js-ask-question-link'),
    ];
    const storyQuestionsComponent = document.querySelector(
        '.js-view-tracking-component'
    );
    const atomElement = document.querySelector('.js-storyquestion-atom-id');

    askQuestionLinks.forEach(el => {
        el.addEventListener('click', askQuestion);
    });

    if (!storyQuestionsComponent || !atomElement) {
        return;
    }

    mediator.on('window:throttledScroll', function onScroll() {
        const { height } = detect.getViewport();
        const { top, bottom } = storyQuestionsComponent.getBoundingClientRect();
        const isStoryQuestionsInView = top >= 0 && bottom <= height;

        if (!isStoryQuestionsInView) {
            return;
        }

        const atomId = atomElement.getAttribute('id');

        if (atomId) {
            ophan.record({
                atomId,
                component: atomId,
                value: 'question_component_in_view',
            });
        }

        mediator.off('window:throttledScroll', onScroll);
    });
};

export { init };
