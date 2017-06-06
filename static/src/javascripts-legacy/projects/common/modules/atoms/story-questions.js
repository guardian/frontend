define([
    'lib/mediator',
    'lib/detect',
    'lib/$',
    'lib/fetch',
    'bean',
    'lib/config',
    'ophan/ng'
], function (
    mediator,
    detect,
    $,
    fetch,
    bean,
    config,
    ophan
) {

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

                    ophan.record({
                        atomId: atomId.trim(),
                        component: questionText.trim(),
                        value: 'question_asked'
                    });
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
                });
            });

            var answersEmailSignupForms = $('.js-storyquestion-email-signup-form');

            answersEmailSignupForms.each(function (el) {
                bean.on(el, 'submit', submitSignUpForm);
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
                            ophan.record({
                                atomId: atomId.trim(),
                                component: atomId.trim(),
                                value: 'question_component_in_view'
                            });
                        }

                        mediator.off('window:throttledScroll', onScroll);
                    }
                });
            }
        }
    };

});
