// @flow
import ophan from 'ophan/ng';
import { session as sessionStorage, local as localStorage } from 'lib/storage';
import { campaignsFor } from 'common/modules/commercial/targeting-tool';
import { init as initSurvey, BusinessError } from './survey';

type Answer = number;
type Question = number;
type CampaignQuestion = {
    question: string,
    askWhy: boolean,
};
type CampaignFields = {
    campaignId: string,
    questions: CampaignQuestion[],
};
type Campaign = {
    fields: CampaignFields,
};

// campaign settings: most of it will come from the targeting tool
const campaignId: string = 'test-survey';
// survey starts on Aug 23, 2017
const startOfSurvey: Date = new Date('2017-07-23');
const endOfSurvey: number = startOfSurvey.setMonth(
    startOfSurvey.getMonth() + 1
);

/* Generate a [from .. to[ range */
const range = (from: number, to: number): number[] => {
    const rangerec = (n: number, acc: number[]): number[] => {
        if (n >= to) {
            return acc;
        }
        return rangerec(n + 1, acc.concat(n));
    };
    return rangerec(from, []);
};

/* Draw a random sample of 3 questions */
const draw = (questions: Object[]): number[] => {
    const lottery: number[] = range(0, questions.length);
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

/* Choose a question out of the remaingin pool for this session */
const selectQuestion = (qs: Question[], as: Answer[]): number => {
    // indices of open questions
    const oqs = as.reduce((acc, a, i) => (a === -1 ? acc.concat(i) : acc), []);

    if (!oqs.length) {
        return -1;
    }

    return oqs[Math.floor(Math.random() * oqs.length)];
};

/* Record answer and send data to Ophan */
const save = (
    qs: Question[],
    as: Answer[],
    q: Question,
    answer: Answer,
    why: ?boolean
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
        why: !!why,
    });
};

const shouldIGo = (): boolean => {
    const now = new Date().getHours();
    const rand = Math.random() * 100;
    return !(
        // between 3pm and 4pm
        now === 15 &&
        // on a 1.5% sample of PVs
        rand < 1.5 &&
        // if the user hasn't already seen the survey
        sessionStorage.get('gu.jtbd.seen') !== true
    );
};

const init = (): void => {
    const campaigns: Campaign[] = campaignsFor(campaignId);
    const campaign: ?Campaign = campaigns.find(
        c => c.fields.campaignId === campaignId
    );

    // Should I stay or should I go?
    if (!campaign || shouldIGo()) {
        return;
    }

    sessionStorage.set('gu.jtbd.seen', true);

    const allQuestions = campaign.fields.questions;
    const qs = localStorage.get('gu.jtbd.questions') || draw(allQuestions);
    const as = localStorage.get('gu.jtbd.answers') || qs.map(() => -1);
    const q = selectQuestion(qs, as);

    if (q === -1) {
        return;
    }

    localStorage.setIfNotExists('gu.jtbd.questions', qs, {
        expires: endOfSurvey,
    });

    initSurvey(allQuestions[qs[q]].question, allQuestions[qs[q]].askWhy)
        .then(({ answer, why }) => save(qs, as, q, answer, why))
        .catch((reason: Error) => {
            if (reason instanceof BusinessError) {
                return;
            }

            throw reason;
        });
};

export { init };
