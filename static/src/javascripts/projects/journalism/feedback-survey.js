// @flow
import ophan from 'ophan/ng';
import { local as localStorage } from 'lib/storage';
import { init as initSurvey, BusinessError } from './survey';

// campaign settings: most of it will come from the targeting tool
// const campaignId: string = 'abcd';
const startOfTest: Date = new Date('2017-07-06');
const endOfTest: number = startOfTest.setMonth(startOfTest.getMonth() + 1);
const viewsPerMonth: number = 60;
const viewsPerDay: number = viewsPerMonth / 30;
const question: string = 'What are we having for breakfast?';
const askWhy: boolean = true;

const daysBetween = (date1: Date, date2: Date): number => {
    const ms = 1000 * 3600 * 24;
    return Math.floor((date2.getTime() - date1.getTime()) / ms);
};

const save = (answer: string, why: ?string): void => {
    const hasSnippet: boolean = !!document.getElementsByClassName(
        'explainer-snippet'
    ).length;

    ophan.record(
        Object.assign({
            component: 'article-feedback-survey',
            hasSnippet,
            answer,
            why,
        })
    );
};

const init = (): void => {
    const daysSinceStart = daysBetween(startOfTest, new Date());

    // Should I stay or should I go?
    const views = (localStorage.get('gu.article-feedback.views') || 0) + 1;

    const viewsToday = Math.max(0, views - viewsPerDay * daysSinceStart);

    if (views > viewsPerMonth || viewsToday > viewsPerDay) {
        return;
    }

    localStorage.set('gu.article-feedback.views', views, {
        expires: endOfTest,
    });

    initSurvey(question, askWhy)
        .then(({ answer, why }) => save(answer, why))
        .catch((reason: Error) => {
            if (reason instanceof BusinessError) {
                return;
            }

            throw reason;
        });
};

export { init };
