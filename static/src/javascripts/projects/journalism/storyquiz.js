// @flow
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';

const StoryQuiz = (quiz: Element) => {
    let currentCard: number = -1;
    const results: boolean[] = [];

    let cards: Element[];
    let score: ?Element;

    const sendResults = (correct: number, total: number): void => {
        const snippetOpen = [
            ...document.getElementsByClassName('explainer-snippet'),
        ].reduce(
            (res: boolean, el: any): boolean =>
                res || (el: HTMLDetailsElement).open,
            false
        );
        ophan.record(
            Object.assign(
                {
                    component: `storyquiz__${quiz.id}`,
                    correct,
                    total,
                    snippetOpen,
                },
                results.reduce(
                    (acc: Object, res: boolean, i: number): Object => {
                        acc[`question${i}`] = res;
                        return acc;
                    },
                    {}
                )
            )
        );
    };

    const onBeforeCardActivate = (cardIndex: number): Promise<void> => {
        if (cardIndex < cards.length - 1) {
            return Promise.resolve();
        }

        const correct: number = results.filter(Boolean).length;
        const total: number = results.length;
        const final: ?Element = [
            ...quiz.querySelectorAll('.storyquiz__result'),
        ].find(el => parseInt(el.dataset.minScore, 10) >= correct);

        sendResults(correct, total);

        return fastdom.write(() => {
            if (score) score.innerHTML = `${correct} out of ${total}!`;
            if (final) final.classList.add('is-result');
        });
    };

    const activeCard = (newCard: number): Promise<void> =>
        onBeforeCardActivate(newCard).then(() =>
            fastdom.write(() => {
                cards[currentCard].classList.remove('is-active');
                cards[newCard].classList.add('is-active');
                currentCard = newCard;
            })
        );

    const revealAnswer = (
        cardIndex: number,
        correct: boolean,
        answerId: ?string
    ): void => {
        const comment = answerId && document.getElementById(answerId);
        fastdom.write(() => {
            cards[cardIndex].classList.add('is-answered');
            cards[cardIndex].classList.add(correct ? 'is-correct' : 'is-wrong');
            if (comment) {
                comment.classList.add('is-answer');
            }
        });
    };

    const reset = () => {
        currentCard = 0;
        results.length = 0;
        const els = [
            ...quiz.querySelectorAll(
                '.is-active, .is-answered, .is-answer, .is-result'
            ),
        ];
        fastdom.write(() => {
            els.forEach(el => {
                el.classList.remove('is-answered');
                el.classList.remove('is-correct');
                el.classList.remove('is-wrong');
                el.classList.remove('is-answer');
                el.classList.remove('is-result');
                el.classList.remove('is-active');
            });
            cards[0].classList.add('is-active');
        });
    };

    const onClick = (evt: Event): void => {
        const button = ((evt.target: any): Element).closest('.button');
        if (!button) {
            return;
        }
        if (button.classList.contains('storyquiz__reset')) {
            reset();
        } else {
            activeCard(currentCard + 1);
        }
    };

    const onChange = (evt: Event): void => {
        const radio = ((evt.target: any): Element).closest('input[type=radio]');
        if (!radio || !(radio instanceof HTMLInputElement)) {
            return;
        }
        const correct: boolean = radio.value === '1';
        results.push(correct);
        revealAnswer(currentCard, correct, radio.getAttribute('aria-controls'));
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

        currentCard = 0;
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
