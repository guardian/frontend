// @flow
import ophan from 'ophan/ng';
import { session as sessionStorage, local as localStorage } from 'lib/storage';
import { campaignsFor } from 'common/modules/commercial/targeting-tool';
import { init as initSurvey, BusinessError } from './survey';

type Answer = number;
type Question = number;

// campaign settings: most of it will come from the targeting tool
const campaignId: string = 'audience-jtbd-survey';
// survey starts on Aug 23, 2017
const startOfSurvey: Date = new Date('2017-07-23'); 
const endOfSurvey: number = startOfSurvey.setMonth(startOfSurvey.getMonth() + 1);
const allQuestions: Object[] = [
    {
        question:
            'I came to The Guardian just now for in-depth coverage of this topic.',
        ask: false,
    },
    {
        question:
            'I came to The Guardian just now because I have a few minutes to spare.',
        ask: false,
    },
    {
        question:
            'I came to The Guardian just now to see what’s going on in the world.',
        ask: false,
    },
    {
        question:
            'I came to The Guardian just now to answer a specific question.',
        ask: false,
    },
];

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
    localStorage.set('gu.jtbd.answers', as, { expires: endOfSurvey });

    ophan.record({
        component: 'jtbd-survey',
        hasSnippet,
        qs,
        as,
        why,
    });
};

const shouldIGo = (): boolean => {
    const now = new Date().getHours();
    const rand = Math.random() * 100;
    return !(
        (now >= 15 || now > 17) &&
        rand < 1.5 &&
        sessionStorage.get('gu.jtbd.seen') !== true
    );
};

const init = (): void => {
    // Should I stay or should I go?
    if (shouldIGo()) {
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
        expires: endOfSurvey,
    });

    initSurvey(allQuestions[qs[q]].question, allQuestions[qs[q]].ask)
        .then(({ answer, why }) => save(qs, as, q, answer, why))
        .catch((reason: Error) => {
            if (reason instanceof BusinessError) {
                return;
            }

            throw reason;
        });
};

export { init };
