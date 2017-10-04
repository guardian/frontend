// @flow

import mediator from 'lib/mediator';
import { getViewport } from 'lib/detect';
import $ from 'lib/$';
import fetch from 'lib/fetch';
import bean from 'bean';
import config from 'lib/config';
import ophan from 'ophan/ng';
import { getUserFromApi } from 'common/modules/identity/api';
import fastdom from 'fastdom';
import { submitComponentEvent } from 'common/modules/commercial/acquisitions-ophan';

const sendOldStyleInteraction = (
    atomId: string,
    component: string,
    value: string
): void => {
    ophan.record({
        atomId,
        component,
        value,
    });
};

const sendNewStyleInteraction = (
    atomId: string,
    action: string,
    value?: string,
    eventId?: string
): void => {
    const event: Object = {
        component: {
            componentType: 'READERS_QUESTIONS_ATOM',
            id: atomId,
        },
        action,
    };

    if (value) {
        event.value = value;
    }

    if (eventId) {
        event.id = eventId;
    }

    submitComponentEvent(event);
};

const askQuestion = (
    event: Event,
    isEmailSubmissionReady: boolean | string
): void => {
    event.preventDefault();

    const currentTarget = ((event.target: any): HTMLElement);
    const askQuestionBtn = currentTarget.querySelector(
        '.user__question-upvote'
    );
    const atomIdElement = $('.js-storyquestion-atom-id');

    if (askQuestionBtn && atomIdElement) {
        const questionId = askQuestionBtn.dataset.questionId;
        const atomId = atomIdElement.attr('id');

        const question = ((document.querySelector(
            `meta[name=js-notranslate-${questionId}]`
        ): any): HTMLMetaElement);

        if (question) {
            const questionText = question.content;

            if (questionText && atomId) {
                if (askQuestionBtn) {
                    askQuestionBtn.classList.add('is-hidden');
                }

                if (isEmailSubmissionReady === 'true') {
                    /* I had to make this a one-liner, because otherwise I
                       couldn't find a way to tell flow to ignore the next
                       line */
                    /* eslint-disable prettier/prettier */
                    // $FlowFixMe
                    const signupForm = document.forms[`js-storyquestion-email-signup-form-${questionId}`];
                    /* eslint-enable */
                    const thankYouMessageForEmailSubmission = document.getElementById(
                        `js-question-thankyou-${questionId}`
                    );

                    if (thankYouMessageForEmailSubmission && signupForm) {
                        thankYouMessageForEmailSubmission.classList.remove(
                            'is-hidden'
                        );
                        signupForm.classList.remove('is-hidden');
                    }
                } else {
                    const thankYouMessageNoEmailSubmission = document.getElementById(
                        `js-thankyou-message-no-submission-${questionId}`
                    );

                    if (thankYouMessageNoEmailSubmission) {
                        thankYouMessageNoEmailSubmission.classList.remove(
                            'is-hidden'
                        );
                    }
                }

                sendOldStyleInteraction(
                    atomId.trim(),
                    questionText.trim(),
                    'question_asked'
                );
                sendNewStyleInteraction(
                    atomId.trim(),
                    'VOTE',
                    questionText.trim(),
                    questionId
                );
            }
        }
    }
};

const submitSignUpForm = (event: Event): void => {
    event.preventDefault();

    const answersEmailSignupForm = ((event.currentTarget: any): HTMLFormElement);
    // $FlowFixMe
    const email = ((answersEmailSignupForm.elements
        .email: any): HTMLInputElement);
    /* We ran into a conflict between Flow and ESlint - ESlint want's the
       dot-notation, but flow can only handle array-notation */
    // eslint-disable-next-line dot-notation
    const listId = ((answersEmailSignupForm['listId']: any): HTMLInputElement);
    const questionId = answersEmailSignupForm.dataset.questionId;
    const atomIdElement = $('.js-storyquestion-atom-id');
    const question = ((document.querySelector(
        `meta[name=js-notranslate-${questionId}]`
    ): any): HTMLMetaElement);

    if (email && listId && questionId) {
        fetch(`${config.get('page.ajaxUrl')}/story-questions/answers/signup`, {
            mode: 'cors',
            method: 'POST',
            body: {
                email: email.value,
                listId: listId.value,
            },
        }).then(response => {
            if (response.ok) {
                const submissionContainerEl =
                    answersEmailSignupForm.parentElement;
                const thankyouMessage = document.getElementById(
                    `js-final-thankyou-message-${questionId}`
                );

                if (submissionContainerEl && thankyouMessage) {
                    submissionContainerEl.classList.add('is-hidden');
                    thankyouMessage.classList.remove('is-hidden');
                }
            }
        });

        const atomId = atomIdElement.attr('id');
        const questionText = question.content;

        sendNewStyleInteraction(
            atomId.trim(),
            'SUBSCRIBE',
            questionText.trim(),
            questionId
        );
    }
};

const initStoryQuestions = (): void => {
    const askQuestionLinks = $('.js-ask-question-link');
    const isEmailSubmissionReadyElement = document.getElementById(
        'js-storyquestion-is-email-submission-ready'
    );
    let isEmailSubmissionReady = false;

    if (isEmailSubmissionReadyElement) {
        isEmailSubmissionReady = isEmailSubmissionReadyElement.dataset
            .isEmailSubmissionReady
            ? isEmailSubmissionReadyElement.dataset.isEmailSubmissionReady
            : false;
    }

    askQuestionLinks.each(el => {
        bean.on(el, 'click', (event: Event): void => {
            askQuestion(event, isEmailSubmissionReady);
            el.classList.add('is-clicked');
        });
    });

    const answersEmailSignupForms = $('.js-storyquestion-email-signup-form');

    answersEmailSignupForms.each(el => {
        bean.on(el, 'submit', submitSignUpForm);
    });

    getUserFromApi(userFromId => {
        if (userFromId && userFromId.primaryEmailAddress) {
            fastdom.write(() => {
                $('.js-storyquestion-email-signup-form').each(form => {
                    $(
                        '.js-storyquestion-email-signup-button',
                        form
                    ).removeClass('button--with-input');
                    $(
                        '.js-storyquestion-email-signup-input-container',
                        form
                    ).addClass('is-hidden');
                    $('.js-storyquestion-email-signup-input', form).val(
                        userFromId.primaryEmailAddress
                    );
                    $('.inline-envelope', form).addClass(
                        'storyquestion-email-signup-button-envelope'
                    );
                });
            });
        }
    });

    const storyQuestionsComponent = document.querySelector(
        '.js-view-tracking-component'
    );
    const atomElement = $('.js-storyquestion-atom-id');

    if (storyQuestionsComponent && atomElement) {
        const onScroll = () => {
            const height = getViewport().height;
            const coords = storyQuestionsComponent.getBoundingClientRect();
            const isStoryQuestionsInView =
                coords.top >= 0 && coords.bottom <= height;

            if (isStoryQuestionsInView) {
                const atomId = atomElement.attr('id');

                if (atomId) {
                    sendOldStyleInteraction(
                        atomId.trim(),
                        atomId.trim(),
                        'question_component_in_view'
                    );

                    sendNewStyleInteraction(atomId.trim(), 'VIEW');
                }

                mediator.off('window:throttledScroll', onScroll);
            }
        };

        mediator.on('window:throttledScroll', onScroll);
    }
};

export { initStoryQuestions };
