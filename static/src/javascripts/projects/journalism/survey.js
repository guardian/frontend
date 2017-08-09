// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import surveyT from 'raw-loader!./views/jtbd.html';

// Flow doesn't recognize this standard DOM type
// https://developer.mozilla.org/en/docs/Web/API/RadioNodeList
type RadioNodeList = { value: string };

type Question = string;

class BusinessError extends Error {}

const survey = template(surveyT);

const ask = ({ question, askWhy }: { question: Question, askWhy: boolean }) => {
    const hook: ?Element = document.querySelector('.js-article__body');
    if (!hook) {
        throw new BusinessError();
    }

    return fastdom.write(() => {
        hook.insertAdjacentHTML(
            'beforeend',
            survey({
                question,
                askWhy,
            })
        );
    });
};

const respond = (): Promise<Object> => {
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
                answer: parseInt(answer.value, 10),
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

const init = (question: string, askWhy: boolean): Promise<Object> =>
    Promise.resolve({ question, askWhy })
        .then(ask)
        // - and wait for the answer
        .then(respond);

export { init, BusinessError };
