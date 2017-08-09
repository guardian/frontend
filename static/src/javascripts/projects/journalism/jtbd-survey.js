// @flow
import ophan from 'ophan/ng';
import { session as sessionStorage, local as localStorage } from 'lib/storage';
import { init as initSurvey, BusinessError } from './survey';

type Answer = number;
type Question = number;

// campaign settings: most of it will come from the targeting tool
// const campaignId: string = 'abcd';
const startOfTest: Date = new Date();
const endOfTest: number = startOfTest.setMonth(startOfTest.getMonth() + 1);
const allQuestions: string[] = [
    'How are you?',
    'Any plans today?',
    "What colour is St James's cathedral?",
    'How many as are there in Srinivasa Ramanujan?',
];
const askWhy: boolean = true;

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

const selectQuestion = (qs: Question[], as: Answer[]): number => {
    // open questions
    const oqs = as.reduce((acc, a, i) => (a === -1 ? acc.concat(i) : acc), []);

    if (!oqs.length) {
        return -1;
    }

    return oqs[Math.floor(Math.random() * oqs.length)];
};

const save = (
    qs: Question[],
    as: Answer[],
    q: Question,
    answer: Answer,
    why: ?string
) => {
    const hasSnippet: boolean = !!document.getElementsByClassName(
        'explainer-snippet'
    ).length;

    as[q] = answer;
    localStorage.set('gu.jtbd.answers', as, { expires: endOfTest });

    ophan.record({
        component: 'jtbd-survey',
        hasSnippet,
        qs,
        as,
        why,
    });
};

const init = (): void => {
    // Should I stay or should I go?
    if (sessionStorage.get('gu.jtbd.seen') === true) {
        return;
    }

    sessionStorage.set('gu.jtbd.seen', true);

    const qs = localStorage.get('gu.jtbd.questions') || draw();
    const as = localStorage.get('gu.jtbd.answers') || qs.map(() => -1);
    const q = selectQuestion(qs, as);

    if (q === -1) {
        return;
    }

    localStorage.setIfNotExists('gu.jtbd.questions', qs, {
        expires: endOfTest,
    });

    initSurvey(allQuestions[qs[q]], askWhy)
        .then(({ answer, why }) => save(qs, as, q, answer, why))
        .catch((reason: Error) => {
            if (reason instanceof BusinessError) {
                return;
            }

            throw reason;
        });
};

export { init };
