// @flow
import { local as localStorage } from 'lib/storage';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import surveyT from 'raw-loader!./views/jtbd.html';

type RadioNodeList = { value: string };
type Answer = number;
type Question = number;

// const campaignId: string = 'abcd';
const startOfTest: Date = new Date();
const endOfTest: number = startOfTest.setMonth(startOfTest.getMonth() + 1);
const survey: Object => string = template(surveyT);

const allQuestions: string[] = [
    'How are you?',
    'Any plans today?',
    "What colour is St Jame's cathedral?",
    'How many is are there is Srivini?',
];

class BusinessError extends Error {}

const range = (from: number, to: number): number[] => {
    const res: number[] = [];
    let i = from;
    while (i < to) {
        res[i - from] = i;
        i += 1;
    }
    return res;
};

const draw = (): number[] => {
    const lottery = range(0, allQuestions.length);
    let i;

    i = Math.floor(Math.random() * lottery.length);
    const q1 = lottery[i];

    // ¯\_(ツ)_/¯
    lottery.splice(i, 1);
    i = Math.floor(Math.random() * lottery.length);
    const q2 = lottery[i];

    lottery.splice(i, 1);
    i = Math.floor(Math.random() * lottery.length);
    const q3 = lottery[i];

    return [q1, q2, q3];
};

const setQuestions = (qs: Question[]) => {
    localStorage.setIfNotExists('gu.jtbd.questions', qs, {
        expires: endOfTest,
    });
    return qs;
};

const getAnswers = (qs: Question[]) => ({
    qs,
    as: localStorage.get('gu.jtbd.answers') || qs.map(() => -1),
});

const selectQuestion = ({ qs, as }: { qs: Question[], as: Answer[] }) => {
    const oqs = as.reduce((acc, a, i) => (a === -1 ? acc.concat(i) : acc), []);

    if (!oqs.length) {
        throw new BusinessError();
    }

    return {
        qs,
        as,
        q: oqs[Math.floor(Math.random() * oqs.length)],
    };
};

const ask = ({ qs, as, q }) => {
    const hook: ?Element = document.querySelector('.js-article__body');
    if (!hook) {
        throw new BusinessError();
    }

    return fastdom
        .write(() => {
            hook.insertAdjacentHTML(
                'beforeend',
                survey({
                    question: allQuestions[qs[q]],
                })
            );
            return hook;
        })
        .then(() => ({ as, qs, q }));
};

const respond = ({ as, qs, q }): Promise<Object> => {
    const form: ?HTMLFormElement = (document.getElementById(
        'js-jtbd-survey__form'
    ): any);
    if (!form) {
        throw new Error('Hmm, the JTBD survey should contain ... a survey');
    }

    return new Promise(resolve => {
        form.addEventListener('submit', function onSubmit(evt) {
            evt.preventDefault();
            const answer: ?RadioNodeList = (form.elements.namedItem('q'): any);
            const why: ?HTMLTextAreaElement = (form.elements.namedItem(
                'why'
            ): any);
            if (!answer) return;
            form.removeEventListener('submit', onSubmit);
            resolve({
                qs,
                as,
                q,
                a: parseInt(answer.value, 10),
                why: (why && why.value) || null,
            });
        });
    });
};

const recordAnswer = ({ qs, as, q, a, why }) => {
    as[q] = a;
    localStorage.set('gu.jtbd.answers', as);
    ophan.record({
        component: 'jtbd-survey',
        qs,
        as,
        why,
    });
};

const init = (): void => {
    // - readers are assigned a set of 3 random questions out of a pool of 15
    // lift them into the promise applicative functor; we will use Promise as
    // a coproduct and use resolve as the happy path, reject for business logic
    // errors ʕ•ᴥ•ʔ
    Promise.resolve(localStorage.get('gu.jtbd.questions') || draw())
        // - store these questions in the browser's local storage if needed
        .then(setQuestions)
        // - get answers to these questions
        .then(getAnswers)
        // - select a random question out of those that haven't been answered yet
        .then(selectQuestion)
        // - then ask
        .then(ask)
        // - and wait for the answer
        .then(respond)
        // - report to Ophan
        .then(recordAnswer)
        .catch((reason: Error) => {
            if (reason instanceof BusinessError) {
                return;
            }

            throw reason;
        });
};

export { init };
