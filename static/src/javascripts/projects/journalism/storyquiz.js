// @flow
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import { addEventListener } from 'lib/events';

const StoryQuiz = (quiz: HTMLElement) => {
    let currentCard: number = -1;
    const results: boolean[] = [];

    let cards: Element[];
    let score: ?Element;
    let scene: ?HTMLElement;

    const sendResults = (correct: number, total: number): void => {
        const snippets: Element[] = [
            ...document.getElementsByClassName(
                'explainer-snippet:not(.storyquiz)'
            ),
        ];
        const snippetPresent: boolean = !!snippets.length;
        const snippetOpen: boolean = snippets.reduce(
            (res: boolean, el: any): boolean =>
                res || el.getAttribute('open') === 'open',
            false
        );
        ophan.record(
            Object.assign(
                {
                    component: `storyquiz__${quiz.id}`,
                    correct,
                    total,
                    snippetOpen,
                    snippetPresent,
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

    const demoteCard = (cardIndex: number): Promise<void> => {
        const card = cards[cardIndex];
        const promise = new Promise(resolve => {
            addEventListener(
                card,
                'transitionend',
                () => {
                    fastdom
                        .write(() => {
                            card.classList.remove('is-active');
                            card.classList.remove('ease-out');
                        })
                        .then(resolve);
                },
                { once: true }
            );
        });
        // Kick-off the animation
        fastdom.write(() => {
            card.classList.remove('ease-in');
            card.classList.add('ease-out');
        });
        return promise;
    };

    const promoteCard = (cardIndex: number): Promise<void> => {
        const card = cards[cardIndex];
        return onBeforeCardActivate(cardIndex)
            .then(() => fastdom.read(() => card.getBoundingClientRect().height))
            .then(cardHeight =>
                fastdom.write(() => {
                    if (scene) scene.style.height = `${cardHeight}px`;
                    card.classList.add('is-active');
                    card.classList.add('ease-in');
                    currentCard = cardIndex;
                })
            );
    };

    const revealAnswer = (
        cardIndex: number,
        correct: boolean,
        answerId: ?string
    ): void => {
        const comment = answerId && document.getElementById(answerId);
        const card = cards[cardIndex];
        fastdom
            .write(() => {
                card.classList.add('is-answered');
                card.classList.add(correct ? 'is-correct' : 'is-wrong');
                if (comment) {
                    comment.classList.add('is-answer');
                }
            })
            .then(() => fastdom.read(() => card.getBoundingClientRect().height))
            .then(cardHeight => {
                if (scene) scene.style.height = `${cardHeight}px`;
            });
    };

    const reset = () => {
        results.length = 0;
        const els = [
            ...quiz.querySelectorAll('.is-answered, .is-answer, .is-result'),
        ];
        fastdom.write(() => {
            els.forEach(el => {
                el.classList.remove('is-answered');
                el.classList.remove('is-correct');
                el.classList.remove('is-wrong');
                el.classList.remove('is-answer');
                el.classList.remove('is-result');
            });
            demoteCard(currentCard);
            promoteCard(0);
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
            demoteCard(currentCard);
            promoteCard(currentCard + 1);
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
        scene = (quiz.querySelector('.storyquiz__scene'): any);
        if (!score || !scene) {
            throw new Error(
                'Mother of Jesus! Who took away my DOM nodes? Jenkins! JENKIIIIIIIIINS!'
            );
        }

        quiz.addEventListener('click', onClick);
        quiz.addEventListener('change', onChange);

        promoteCard(0);
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
