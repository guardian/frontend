define([
    'lib/mediator',
    'lib/detect',
    'lib/$',
    'lib/fetch',
    'bean',
    'lib/config',
    'ophan/ng',
    'common/modules/identity/api',
    'fastdom',
    'common/modules/commercial/acquisitions-ophan'
], function (
    mediator,
    detect,
    $,
    fetch,
    bean,
    config,
    ophan,
    Id,
    fastdom,
    componentEvent
) {

    function sendOldStyleInteraction(atomId, component, value) {
        ophan.record({
            atomId: atomId,
            component: component,
            value: value,
        });
    }

    function sendNewStyleInteraction(atomId, action, value, eventId) {
        var event = {
            component: {
                componentType: 'READERS_QUESTIONS_ATOM',
                id: atomId,
            },
            action: action,
        };

        if (value) event.value = value;
        if (eventId) event.id = eventId;


        componentEvent.submitComponentEvent(event);
    }

    function askQuestion(event, isEmailSubmissionReady, isDeliveryTestReady) {
        event.preventDefault();

        var askQuestionBtn = event.currentTarget.querySelector('.user__question-upvote');
        var atomIdElement = $('.js-storyquestion-atom-id');

        if (askQuestionBtn && atomIdElement) {
            var questionId = askQuestionBtn.dataset.questionId;
            var atomId = atomIdElement.attr('id');

            var question = document.querySelector("meta[name=js-notranslate-" + questionId + "]");

            if (question) {
                var questionText = question.content;

                if (questionText && atomId) {

                    if (isDeliveryTestReady) {

                        var askActionHeader = document.getElementById('js-question-set-header-' + atomId);
                        var submitActionHeader = document.getElementById('js-delivery-selection-header-' + atomId);

                        var questionList = Array.from(document.querySelectorAll('.js-question-set-body-' + atomId));
                        var answerDeliveryOptions = document.getElementById('js-delivery-selection-body-' + atomId);

                        if (askActionHeader && questionList && submitActionHeader && answerDeliveryOptions) {
                            submitActionHeader.classList.remove('is-hidden');
                            answerDeliveryOptions.classList.remove('is-hidden');

                            askActionHeader.classList.add('is-hidden');
                            questionList.forEach(function(question) {
                                question.classList.add('is-hidden');
                            });

                        }

                    } else {

                        if (askQuestionBtn) {
                            askQuestionBtn.classList.add('is-hidden');
                        }

                        if (isEmailSubmissionReady) {
                            var signupForm = document.forms['js-storyquestion-email-signup-form-' + questionId];
                            var thankYouMessageForEmailSubmission = document.getElementById('js-question-thankyou-' + questionId);

                            if (thankYouMessageForEmailSubmission && signupForm) {
                                thankYouMessageForEmailSubmission.classList.remove('is-hidden');
                                signupForm.classList.remove('is-hidden');
                            }

                        } else {
                            var thankYouMessageNoEmailSubmission = document.getElementById('js-thankyou-message-no-submission-' + questionId);

                            if (thankYouMessageNoEmailSubmission) {
                                thankYouMessageNoEmailSubmission.classList.remove('is-hidden');
                            }
                        }


                    }

                    sendOldStyleInteraction(atomId.trim(), questionText.trim(), 'question_asked');
                    sendNewStyleInteraction(atomId.trim(), 'VOTE', questionText.trim(), questionId);
                }
            }
        }
    }

    function submitSignUpForm(event) {
        event.preventDefault();

        var answersEmailSignupForm = event.currentTarget;
        var email = answersEmailSignupForm.elements['email'];
        var listId = answersEmailSignupForm.listId;
        var questionId = answersEmailSignupForm.dataset.questionId;
        var atomIdElement = $('.js-storyquestion-atom-id');
        var question = document.querySelector("meta[name=js-notranslate-" + questionId + "]");

        if (email && listId && questionId) {

            fetch(config.page.ajaxUrl + '/story-questions/answers/signup', {
                mode: 'cors',
                method: 'POST',
                body: {email : email.value, listId: listId.value}
            })
                .then(function (response) {
                    if (response.ok) {
                        var submissionContainerEl = answersEmailSignupForm.parentElement;
                        var thankyouMessage = document.getElementById('js-final-thankyou-message-' + questionId);

                        if (submissionContainerEl && thankyouMessage) {
                            submissionContainerEl.classList.add('is-hidden');
                            thankyouMessage.classList.remove('is-hidden');
                        }
                    }
                });

            var atomId = atomIdElement.attr('id');
            var questionText = question.content;

            sendNewStyleInteraction(atomId.trim(), 'SUBSCRIBE', questionText.trim(), questionId);
        }
    }

    function submitDeliveryPreference(event) {

        event.preventDefault();

        var prefAnswerDeliveryBtn = event.target;
        var prefAnswerDelivery = prefAnswerDeliveryBtn.dataset.deliveryMethod;

        var atomIdElement = $('.js-storyquestion-atom-id');
        var atomId = atomIdElement.attr('id');

        if (prefAnswerDelivery) {

            var thankyouMessageHeader = document.getElementById('js-final-thank-you-header-' + atomId);
            var thankyouMessageBody = document.getElementById('js-final-thank-you-body-' + atomId);

            var submitHeader = document.getElementById('js-delivery-selection-header-' + atomId);
            var submitContainer = document.getElementById('js-delivery-selection-body-' + atomId);

            if (thankyouMessageHeader && thankyouMessageBody && submitContainer && submitHeader) {
                submitContainer.classList.add('is-hidden');
                submitHeader.classList.add('is-hidden');
                thankyouMessageHeader.classList.remove('is-hidden');
                thankyouMessageBody.classList.remove('is-hidden');
            }
        }

        sendNewStyleInteraction(atomId.trim(), 'SUBSCRIBE', prefAnswerDelivery.value);
    }

    return {
        init: function() {

            var atomId = $('.js-storyquestion-atom-id').attr('id');

            var isEmailSubmissionReadyElement = document.getElementById('js-storyquestion-is-email-submission-ready');
            var isDeliveryTestReadyElement = document.getElementById('js-storyquestion-is-answer-delivery-test-ready');

            var isEmailSubmissionReady = isEmailSubmissionReadyElement && isEmailSubmissionReadyElement.dataset.isEmailSubmissionReady === 'true';
            var isDeliveryTestReady = isDeliveryTestReadyElement && isDeliveryTestReadyElement.dataset.isAnswerDeliveryTestReady === 'true';

            var readerQuestionsContainer = document.getElementById('user__question-atom-' + atomId);
            var askQuestionLinks = Array.from(document.querySelectorAll('.js-ask-question-link'));

            if (readerQuestionsContainer) {
                bean.one(readerQuestionsContainer, 'click', askQuestionLinks, function (event) {
                    askQuestion(event, isEmailSubmissionReady, isDeliveryTestReady);
                    this.classList.add('is-clicked');
                });
            }
            
            var answersEmailSignupForms = $('.js-storyquestion-email-signup-form');

            answersEmailSignupForms.each(function (el) {
                bean.on(el, 'submit', submitSignUpForm);
            });

            var answerDeliveryPrefContainer = document.getElementById('js-delivery-selection-body-' + atomId);
            var answersDeliveryPreferences = Array.from(document.querySelectorAll('.btn-answer-delivery-' + atomId));

            if (answerDeliveryPrefContainer) {
                bean.one(answerDeliveryPrefContainer, 'click', answersDeliveryPreferences, function (event) {
                    submitDeliveryPreference(event);
                    this.classList.add('is-clicked');
                });
            }
           
            var finalCloseBtn = document.getElementById('js-final-thankyou-message-' + atomId);

            if (finalCloseBtn) {
                bean.one(finalCloseBtn, 'click', function(event) {
                    event.preventDefault();
                    var storyQuestionAtom = document.getElementById('user__question-atom-' + atomId);
                    storyQuestionAtom.classList.add('is-hidden');
                    this.classList.add('is-clicked')
                });
            }

            Id.getUserFromApi(function (userFromId) {
                if (userFromId && userFromId.primaryEmailAddress) {
                    fastdom.write(function () {
                        $('.js-storyquestion-email-signup-form').each(function(form) {
                            $('.js-storyquestion-email-signup-button', form).removeClass('button--with-input');
                            $('.js-storyquestion-email-signup-input-container', form).addClass('is-hidden');
                            $('.js-storyquestion-email-signup-input', form).val(userFromId.primaryEmailAddress);
                            $('.inline-envelope', form).addClass('storyquestion-email-signup-button-envelope');
                        });
                    });
                }
            });


            var storyQuestionsComponent = document.querySelector('.js-view-tracking-component');
            var atomElement = $('.js-storyquestion-atom-id');

            if (storyQuestionsComponent && atomElement) {

                mediator.on('window:throttledScroll', function onScroll() {
                    var height = detect.getViewport().height;
                    var coords = storyQuestionsComponent.getBoundingClientRect();
                    var isStoryQuestionsInView = 0 <= coords.top && coords.bottom <= height;

                    if (isStoryQuestionsInView) {
                        var atomId = atomElement.attr('id');

                        if (atomId) {
                            sendOldStyleInteraction(atomId.trim(), atomId.trim(), 'question_component_in_view');
                            sendNewStyleInteraction(atomId.trim(), 'VIEW');
                        }

                        mediator.off('window:throttledScroll', onScroll);
                    }
                });
            }
        }
    };

});
