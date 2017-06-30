// @flow
import fastdom from 'lib/fastdom-promise';

const StoryQuiz = (quiz: Element) => {
    const state = {
        card: -1,
        total: 0,
        correct: 0,
    };

    let cards: Element[];
    let score: ?Element;
    let comment: ?Element;

    const cannedResponse = (weight: number): string => {
        if (weight === 0) {
            return `ouch, this is the first time someone couldn't get a single answer right. Someone didn't do his homework.`;
        } else if (weight < 5) {
            return `Not too bad, clearly you're paying some attention to what's happening in the world. This wasn't an easy quiz. Try again to see if you can get all questions right.`;
        }
        return `Well done, hombre!`;
    };

    const onBeforeCardActivate = (card: number): Promise<void> => {
        if (card < cards.length - 1) {
            return Promise.resolve();
        }

        return fastdom.write(() => {
            if (score)
                score.innerHTML = `${state.correct} out of ${state.total}`;
            if (comment)
                comment.innerHTML = cannedResponse(state.correct / state.total);
        });
    };

    const activeCard = (newCard: number): void => {
        onBeforeCardActivate(newCard).then(() =>
            fastdom.write(() => {
                cards[state.card].classList.remove('is-active');
                cards[newCard].classList.add('is-active');
                state.card = newCard;
            })
        );
    };

    const revealAnswer = (card: number, correct: boolean): void => {
        fastdom.write(() => {
            cards[card].classList.add('is-answered');
            cards[card].classList.add(correct ? 'is-correct' : 'is-wrong');
        });
    };

    const onClick = (evt: Event): void => {
        const button = ((evt.target: any): Element).closest('.button');
        if (!button) {
            return;
        }
        activeCard(state.card + 1);
    };

    const onChange = (evt: Event): void => {
        const radio = ((evt.target: any): Element).closest('input[type=radio]');
        if (!radio) {
            return;
        }
        revealAnswer(state.card, radio.getAttribute('data-answer') === '1');
    };

    const init = () => {
        cards = [...quiz.getElementsByClassName('storyquiz__card')];
        if (cards.length < 3) {
            throw new Error(
                "Hmm, we're missing some fundamental piece here. Jenkins, lookup the NSA database and find me where the devil was DT yesterday between 10pm and 10.30pm---he might have tweeted or something"
            );
        }

        const outro = cards[cards.length - 1];
        score = outro.querySelector('.storyquiz__score');
        comment = outro.querySelector('.storyquiz__comment');

        if (!score || !comment) {
            throw new Error(
                'Mother of Jesus! Who took away my DOM nodes? Jenkins! JENKIIIIIIIIINS!'
            );
        }

        state.card = 0;
        state.total = cards.length - 2;
        quiz.addEventListener('click', onClick);
        quiz.addEventListener('change', onChange);
    };

    return Object.freeze({
        init,
    });
};

const init = () => {
    const quiz = document.querySelector('.js-storyquiz');
    if (quiz) {
        StoryQuiz(quiz).init();
    }
};

export { init, StoryQuiz };
