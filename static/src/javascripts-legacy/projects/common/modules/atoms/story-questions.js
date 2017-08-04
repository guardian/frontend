define([
    'lib/mediator',
    'lib/detect',
    'lib/$',
    'lib/fetch',
    'bean',
    'lib/config',
    'ophan/ng',
    'common/modules/identity/api',
    'fastdom'
], function (
    mediator,
    detect,
    $,
    fetch,
    bean,
    config,
    ophan,
    Id,
    fastdom
) {
    function vote(event, signedIn) {
        var component = event.currentTarget.closest('.js-view-tracking-component');
        var votes = $('.user__question-container input:checked', component);

        if (votes.length > 0) {

            var atomId = component.dataset.atomId;

            $('.user__question-title', component).text('Thank you for voting');
            $('.user__question-section, .user__question-title--secondary, .js-storyquestion-vote-button', component)
                .addClass('is-hidden');

            if (signedIn) {
                $('.js-storyquestion-email-signup-form', component).removeClass('is-hidden');
            } else {
                $('.js-storyquestion-email-question-button', component).removeClass('is-hidden');
            }

            $('.js-storyquestion-email-question, .js-storyquestion-email-nospam', component)
                .removeClass('is-hidden');

            //Send votes to ophan
            votes.each(function (question) {
                var questionText = $(question).parent().text();

                if (questionText) {
                    ophan.record({
                        atomId: atomId.trim(),
                        component: questionText.trim(),
                        value: 'question_asked'
                    });
                }
            });
        }
    }

    function emailMe(event) {
        var component = event.currentTarget.closest('.js-view-tracking-component');

        $('.js-storyquestion-email-question, .js-storyquestion-email-question-button, .js-storyquestion-email-nospam', component)
            .addClass('is-hidden');

        $('.js-storyquestion-email-enter, .js-storyquestion-email-signup-form', component)
            .removeClass('is-hidden');
    }

    function submitSignUpForm(event) {
        event.preventDefault();

        var answersEmailSignupForm = event.currentTarget;
        var email = answersEmailSignupForm.elements['email'];
        var listId = answersEmailSignupForm.listId;

        if (email && listId) {
            fetch(config.page.ajaxUrl + '/story-questions/answers/signup', {
                mode: 'cors',
                method: 'POST',
                body: {email : email.value, listId: listId.value}
            })
            .then(function (response) {
                if (response.ok) {
                    var component = event.currentTarget.closest('.js-view-tracking-component');
                    $('.js-storyquestion-email-done', component).removeClass('is-hidden');

                    $('.js-storyquestion-email-question, .js-storyquestion-email-signup-form, .js-storyquestion-email-enter, .js-storyquestion-email-nospam', component)
                        .addClass('is-hidden');
                }
            });
        }
    }

    return {
        init: function() {

            $('.js-storyquestion-email-question-button').each(function(el) {
                bean.one(el, 'click', emailMe);
            });

            $('.js-storyquestion-email-signup-form').each(function(el) {
                bean.one(el, 'submit', submitSignUpForm);
            });

            Id.getUserFromApi(function (userFromId) {
                var signedIn = (userFromId && userFromId.primaryEmailAddress) != null;

                if (signedIn) {
                    fastdom.write(function () {
                        $('.js-storyquestion-email-signup-form').each(function(form) {
                            $('.button--with-input', form).removeClass('button--with-input');
                            $('.js-storyquestion-email-signup-input-container', form).addClass('is-hidden');
                            $('.js-storyquestion-email-signup-input', form).val(userFromId.primaryEmailAddress);
                            $('.inline-envelope', form).addClass('storyquestion-email-signup-button-envelope');
                        });
                    });
                }

                $('.js-storyquestion-vote-button').each(function(el) {
                    bean.on(el, 'click', function(event) {
                        vote(event, signedIn);
                    });
                });
            });


            var storyQuestionsComponent = document.querySelector('.js-view-tracking-component');

            if (storyQuestionsComponent) {

                mediator.on('window:throttledScroll', function onScroll() {
                    var height = detect.getViewport().height;
                    var coords = storyQuestionsComponent.getBoundingClientRect();
                    var isStoryQuestionsInView = 0 <= coords.top && coords.bottom <= height;

                    if (isStoryQuestionsInView) {
                        var atomId = storyQuestionsComponent.dataset.atomId;

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
