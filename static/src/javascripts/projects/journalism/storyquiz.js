// @flow
import fastdom from 'lib/fastdom-promise';

const StoryQuiz = (quiz: Element) => {
    const state = {
        card: -1,
        results: [],
    };

    let cards: Element[];
    let score: ?Element;

    const onBeforeCardActivate = (card: number): Promise<void> => {
        if (card < cards.length - 1) {
            return Promise.resolve();
        }

        const correct: number = state.results.filter(Boolean).length;
        const total: number = state.results.length;

        return fastdom.write(() => {
            if (score) score.innerHTML = `${correct} out of ${total}`;
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

    const revealAnswer = (
        card: number,
        correct: boolean,
        answerId: ?string
    ): void => {
        const comment = answerId && document.getElementById(answerId);
        fastdom.write(() => {
            cards[card].classList.add('is-answered');
            cards[card].classList.add(correct ? 'is-correct' : 'is-wrong');
            if (comment) {
                comment.classList.add('is-answer');
            }
        });
    };
    //
    // const reset = () => {
    //     const els = [...quiz.querySelectorAll('.is-answered, .is-answer')];
    //     fastdom.write(() => {
    //         els.forEach(el => {
    //             el.classList.remove('.is-answered');
    //             el.classList.remove('.is-answer');
    //         });
    //     });
    // };

    const onClick = (evt: Event): void => {
        const button = ((evt.target: any): Element).closest('.button');
        if (!button) {
            return;
        }
        activeCard(state.card + 1);
    };

    const onChange = (evt: Event): void => {
        const radio = ((evt.target: any): Element).closest('input[type=radio]');
        if (!radio || !(radio instanceof HTMLInputElement)) {
            return;
        }
        const correct: boolean = radio.value === '1';
        state.results.push(correct);
        revealAnswer(state.card, correct, radio.getAttribute('aria-controls'));
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
        if (!score) {
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
