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
    action: OphanAction,
    value: ?string,
    eventId: ?string
): void => {
    const event: OphanComponentEvent = {
        component: {
            componentType: 'READERS_QUESTIONS_ATOM',
            id: atomId,
        },
        action,
    };

    if (value) event.value = value;
    if (eventId) event.id = eventId;

    submitComponentEvent(event);
};

const askQuestion = (
    event: Event,
    isEmailSubmissionReady: boolean,
    isDeliveryTestReady: boolean
): void => {
    if (!(event.currentTarget instanceof HTMLElement)) return;

    event.preventDefault();

    const askQuestionBtn: ?HTMLElement = (event.currentTarget: any).querySelector(
        '.user__question-upvote'
    );
    const atomIdElement: ?HTMLElement = document.querySelector(
        '.js-storyquestion-atom-id'
    );

    if (!askQuestionBtn || !atomIdElement) return;

    const questionId: ?string = askQuestionBtn.dataset.questionId;
    const atomId: string = atomIdElement.id;

    if (!questionId) return;

    const question: ?HTMLMetaElement = (document.querySelector(
        `meta[name=js-notranslate-${questionId}]`
    ): any);

    if (!question) return;

    const questionText: ?string = question.content;

    if (!questionText) return;

    if (isDeliveryTestReady) {
        const askActionHeader: ?Element = document.getElementById(
            `js-question-set-header-${atomId}`
        );
        const submitActionHeader: ?Element = document.getElementById(
            `js-delivery-selection-header-${atomId}`
        );

        const questionList: Element[] = [
            ...document.querySelectorAll(`.js-question-set-body-${atomId}`),
        ];
        const answerDeliveryOptions: ?Element = document.getElementById(
            `js-delivery-selection-body-${atomId}`
        );

        if (
            askActionHeader &&
            questionList.length &&
            submitActionHeader &&
            answerDeliveryOptions
        ) {
            fastdom.write(() => {
                submitActionHeader.classList.remove('is-hidden');
                answerDeliveryOptions.classList.remove('is-hidden');

                askActionHeader.classList.add('is-hidden');
                questionList.forEach(q => {
                    q.classList.add('is-hidden');
                });
            });
        }
    } else {
        fastdom.write(() => {
            if (askQuestionBtn) {
                askQuestionBtn.classList.add('is-hidden');
            }

            if (isEmailSubmissionReady) {
                const signupForm: ?Element = document.forms.namedItem(
                    `js-storyquestion-email-signup-form-${questionId}`
                );
                const thankYouMessageForEmailSubmission: ?Element = document.getElementById(
                    `js-question-thankyou-${questionId}`
                );

                if (thankYouMessageForEmailSubmission && signupForm) {
                    thankYouMessageForEmailSubmission.classList.remove(
                        'is-hidden'
                    );
                    signupForm.classList.remove('is-hidden');
                }
            } else {
                const thankYouMessageNoEmailSubmission: ?Element = document.getElementById(
                    `js-thankyou-message-no-submission-${questionId}`
                );

                if (thankYouMessageNoEmailSubmission) {
                    thankYouMessageNoEmailSubmission.classList.remove(
                        'is-hidden'
                    );
                }
            }
        });
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
};

const submitSignUpForm = (event: Event): void => {
    if (!(event.currentTarget instanceof HTMLFormElement)) return;

    event.preventDefault();

    const answersEmailSignupForm: HTMLFormElement = (event.currentTarget: any);
    const email: ?HTMLInputElement = (answersEmailSignupForm.elements.namedItem(
        'email'
    ): any);
    const listId: ?HTMLInputElement = (answersEmailSignupForm.elements.namedItem(
        'listId'
    ): any);
    const questionId: ?string = answersEmailSignupForm.dataset.questionId;
    const atomIdElement: ?Element = document.querySelector(
        '.js-storyquestion-atom-id'
    );

    if (!email || !listId || !questionId || !atomIdElement) return;

    const question: ?HTMLMetaElement = (document.querySelector(
        `meta[name=js-notranslate-${questionId}]`
    ): any);

    if (!question) return;

    fetch(`${config.get('page.ajaxUrl')}/story-questions/answers/signup`, {
        mode: 'cors',
        method: 'POST',
        body: {
            email: email.value,
            listId: listId.value,
        },
    }).then(response => {
        if (response.ok) {
            const submissionContainerEl = answersEmailSignupForm.parentElement;
            const thankyouMessage = document.getElementById(
                `js-final-thankyou-message-${questionId}`
            );

            if (submissionContainerEl && thankyouMessage) {
                submissionContainerEl.classList.add('is-hidden');
                thankyouMessage.classList.remove('is-hidden');
            }
        }
    });

    const atomId: string = atomIdElement.id;
    const questionText: string = question.content || '';

    sendNewStyleInteraction(
        atomId.trim(),
        'SUBSCRIBE',
        questionText.trim(),
        questionId
    );
};

const submitDeliveryPreference = (event: Event): void => {
    if (!(event.target instanceof HTMLElement)) return;

    event.preventDefault();

    const prefAnswerDeliveryBtn: HTMLElement = (event.target: any);
    const prefAnswerDelivery = prefAnswerDeliveryBtn.dataset.deliveryMethod;
    const atomIdElement: ?Element = document.querySelector(
        '.js-storyquestion-atom-id'
    );

    if (!atomIdElement || !prefAnswerDelivery) return;

    const atomId: string = atomIdElement.id;

    const thankyouMessageHeader: ?Element = document.getElementById(
        `js-final-thank-you-header-${atomId}`
    );
    const thankyouMessageBody: ?Element = document.getElementById(
        `js-final-thank-you-body-${atomId}`
    );

    const submitHeader: ?Element = document.getElementById(
        `js-delivery-selection-header-${atomId}`
    );
    const submitContainer: ?Element = document.getElementById(
        `js-delivery-selection-body-${atomId}`
    );

    if (
        thankyouMessageHeader &&
        thankyouMessageBody &&
        submitContainer &&
        submitHeader
    ) {
        submitContainer.classList.add('is-hidden');
        submitHeader.classList.add('is-hidden');
        thankyouMessageHeader.classList.remove('is-hidden');
        thankyouMessageBody.classList.remove('is-hidden');
    }

    sendNewStyleInteraction(atomId.trim(), 'SUBSCRIBE', prefAnswerDelivery);
};

const init = (): void => {
    const atomId: ?string = $('.js-storyquestion-atom-id').attr('id');

    if (!atomId) return;

    const isEmailSubmissionReadyElement: ?HTMLElement = document.getElementById(
        'js-storyquestion-is-email-submission-ready'
    );
    const isDeliveryTestReadyElement: ?HTMLElement = document.getElementById(
        'js-storyquestion-is-answer-delivery-test-ready'
    );

    const isEmailSubmissionReady: boolean = !!(
        isEmailSubmissionReadyElement &&
        isEmailSubmissionReadyElement.dataset.isEmailSubmissionReady === 'true'
    );
    const isDeliveryTestReady: boolean = !!(
        isDeliveryTestReadyElement &&
        isDeliveryTestReadyElement.dataset.isAnswerDeliveryTestReady === 'true'
    );

    const askQuestionLinks: Element[] = [
        ...document.querySelectorAll('.js-ask-question-link'),
    ];

    const answersDeliveryPreferences = document.querySelectorAll(
        `.btn-answer-delivery-${atomId}`
    );
    const answerDeliveryPrefContainer = document.getElementById(
        `js-delivery-selection-body-${atomId}`
    );

    askQuestionLinks.forEach(el => {
        bean.on(el, 'click', event => {
            askQuestion(event, isEmailSubmissionReady, isDeliveryTestReady);
            el.classList.add('is-clicked');
        });
    });

    if (answerDeliveryPrefContainer) {
        const deliveryPrefList = [...answersDeliveryPreferences];

        const pool = [0, 1, 2];
        const flush = [];
        while (pool.length > 0) {
            const rand = Math.floor(Math.random() * pool.length);
            flush.push(pool[rand]);
            pool.splice(rand, 1);
        }

        flush.forEach(num => {
            const relevantBtn = deliveryPrefList[num];
            answerDeliveryPrefContainer.insertBefore(relevantBtn, null);
        });

        bean.one(
            answerDeliveryPrefContainer,
            'click',
            deliveryPrefList,
            event => {
                if (!(event.target instanceof HTMLElement)) return;
                submitDeliveryPreference(event);
                (event.target: any).classList.add('is-clicked');
            }
        );
    }

    const finalCloseBtn: ?Element = document.getElementById(
        `js-final-thankyou-message-${atomId}`
    );

    if (finalCloseBtn) {
        bean.one(finalCloseBtn, 'click', event => {
            event.preventDefault();
            const storyQuestionAtom = document.getElementById(
                `user__question-atom-${atomId}`
            );
            if (storyQuestionAtom) {
                storyQuestionAtom.classList.add('is-hidden');
            }
            finalCloseBtn.classList.add('is-clicked');
        });
    }

    [
        ...document.querySelectorAll('.js-storyquestion-email-signup-form'),
    ].forEach(el => {
        bean.on(el, 'submit', submitSignUpForm);
    });

    getUserFromApi(userFromId => {
        if (userFromId && userFromId.primaryEmailAddress) {
            fastdom.write(() => {
                [
                    ...document.querySelectorAll(
                        '.js-storyquestion-email-signup-form'
                    ),
                ].forEach(form => {
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

    const storyQuestionsComponent: ?Element = document.querySelector(
        '.js-view-tracking-component'
    );
    const atomElement: ?Element = document.querySelector(
        '.js-storyquestion-atom-id'
    );

    if (storyQuestionsComponent && atomElement) {
        const onScroll = () => {
            const height: number = getViewport().height;
            const coords: ClientRect = storyQuestionsComponent.getBoundingClientRect();
            const isStoryQuestionsInView =
                coords.top >= 0 && coords.bottom <= height;

            if (isStoryQuestionsInView) {
                const thisAtomId: string = atomElement.id.trim();

                if (thisAtomId) {
                    sendOldStyleInteraction(
                        thisAtomId,
                        thisAtomId,
                        'question_component_in_view'
                    );
                    sendNewStyleInteraction(thisAtomId, 'VIEW');
                }

                mediator.off('window:throttledScroll', onScroll);
            }
        };
        mediator.on('window:throttledScroll', onScroll);
    }
};

export { init };
