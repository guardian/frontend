// @flow
import { local as localStorage, session as sessionStorage } from 'lib/storage';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import ophan from 'ophan/ng';
import surveyT from 'raw-loader!./views/jtbd.html';

// Flow doesn't recognize this standard DOM type
// https://developer.mozilla.org/en/docs/Web/API/RadioNodeList
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
    "What colour is St James's cathedral?",
    'How many as are there in Srinivasa Ramanujan?',
];

const askWhy: boolean = true;

class BusinessError extends Error {}

const range = (from: number, to: number): number[] => {
    const rangerec = (n: number, acc: number[]): number[] => {
        if (n >= to) {
            return acc;
        }
        return rangerec(n + 1, acc.concat(n));
    };
    return rangerec(from, []);
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
    // open questions
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
                    askWhy,
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
    const feedback: ?HTMLFormElement = (document.getElementById(
        'js-jtbd-survey__feedback'
    ): any);
    if (!form || !feedback) {
        throw new Error('Hmm, the JTBD survey should contain ... a survey');
    }

    return new Promise(resolve => {
        form.addEventListener('submit', function onSubmit(evt) {
            evt.preventDefault();
            const answer: ?RadioNodeList = (form.elements.namedItem('q'): any);
            const why: ?HTMLTextAreaElement = (form.elements.namedItem(
                'why'
            ): any);
            if (!answer || !answer.value) return;
            form.removeEventListener('submit', onSubmit);
            resolve({
                qs,
                as,
                q,
                a: parseInt(answer.value, 10),
                why: (why && why.value) || null,
            });
        });
    }).then(result =>
        fastdom.write(() => {
            form.classList.add('is-hidden');
            feedback.classList.remove('is-hidden');
            return result;
        })
    );
};

const recordAnswer = ({ qs, as, q, a, why }) => {
    as[q] = a;
    localStorage.set('gu.jtbd.answers', as, { expires: endOfTest });
    ophan.record({
        component: 'jtbd-survey',
        qs,
        as,
        why,
    });
};

const init = (): void => {
    // Should I stay or should I go?
    if (config.page.isProd && sessionStorage.get('gu.jtbd.seen') === true) {
        return;
    }

    sessionStorage.set('gu.jtbd.seen', true);

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
