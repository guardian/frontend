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

    function sendNewStyleInteraction(atomId, action, value) {
        var event = {
            component: {
                componentType: 'READERS_QUESTIONS_ATOM',
                id: atomId,
            },
            action: action,
        };

        if (value) event.value = value;

        componentEvent.submitComponentEvent(event);
    }

    function askQuestion(event, isEmailSubmissionReady) {
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

                    if (askQuestionBtn) {
                        askQuestionBtn.classList.add('is-hidden');
                    }

                    if (isEmailSubmissionReady === "true") {
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

                    sendOldStyleInteraction(atomId.trim(), questionText.trim(), 'question_asked');
                    sendNewStyleInteraction(atomId.trim(), 'VOTE', questionText.trim());
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
        }
    }

    return {
        init: function() {
            var askQuestionLinks = $('.js-ask-question-link');
            var isEmailSubmissionReadyElement = document.getElementById('js-storyquestion-is-email-submission-ready');

            var isEmailSubmissionReady = false;

            if (isEmailSubmissionReadyElement) {
                isEmailSubmissionReady = isEmailSubmissionReadyElement.dataset.isEmailSubmissionReady ? isEmailSubmissionReadyElement.dataset.isEmailSubmissionReady : false;
            }

            askQuestionLinks.each(function (el) {
                bean.on(el, 'click', function(event) {
                    askQuestion(event, isEmailSubmissionReady)
                    this.classList.add('is-clicked')
                });
            });

            var answersEmailSignupForms = $('.js-storyquestion-email-signup-form');

            answersEmailSignupForms.each(function (el) {
                bean.on(el, 'submit', submitSignUpForm);
            });


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
