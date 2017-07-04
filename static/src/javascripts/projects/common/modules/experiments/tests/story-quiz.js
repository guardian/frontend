// @flow
import { StoryQuiz } from 'journalism/storyquiz';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';

const StoryQuizTest = () => {
    const id = 'StoryQuiz';
    const start = '2017-07-04';
    const expiry = '2017-08-04';

    const canRun = (): boolean => !!document.querySelector('.js-storyquiz');

    const testNoQuiz = () => {
        const quiz = document.querySelector('.js-storyquiz');
        if (quiz) {
            fastdom.write(() => {
                quiz.remove();
            });
            mediator.emit('ab:storyquiz:notdisplayed');
        }
    };

    const impressionNoQuiz = track => {
        mediator.on('ab:storyquiz:notdisplayed', track);
    };

    const test = () => {
        const quiz = document.querySelector('.js-storyquiz');
        if (quiz) {
            StoryQuiz(quiz).init();
            mediator.emit('ab:storyquiz:displayed');
        }
    };

    const impression = track => {
        mediator.on('ab:storyquiz:displayed', track);
    };

    const success = track => {
        mediator.on('journalism:storyquiz:results', track);
    };

    return Object.freeze({
        id,
        start,
        expiry,
        audience: 1,
        audienceOffset: 0,
        author: 'Nathan',
        description: 'Quiz people who have read the article',
        successMeasure: '',
        audienceCriteria: '',
        idealOutcome:
            'People perform better when there is a snippet in the page that they have opened',
        canRun,
        showForSensitive: true,
        variants: [
            { id: 'no-quiz', test: testNoQuiz, impression: impressionNoQuiz },
            { id: 'do-quiz', test, impression, success },
        ],
    });
};

export { StoryQuizTest };
