define([
    'common/utils/formInlineLabels',
    'bean',
    'common/utils/$',
    'common/utils/ajax-promise',
    'fastdom',
    'common/utils/mediator',
    'common/utils/_',
    'common/utils/template',
    'text!common/views/email/submissionResponse.html'
], function (
    formInlineLabels,
    bean,
    $,
    ajax,
    fastdom,
    mediator,
    _,
    template,
    successHtml
) {
    var classes = {
            wrapper: 'js-email-sub',
            form: 'js-email-sub__form',
            inlineLabel: 'js-email-sub__inline-label',
            textInput: 'js-email-sub__text-input'
        },
        formSubmission = {
            bindSubmit: function ($form) {
                var url = $form.attr('action');
                bean.on($form[0], 'submit', this.submitForm($form, url));
            },
            submitForm: function ($form, url) {
                return function (event) {
                    var data = 'email=' + $('.' + classes.textInput, $form).val();

                    event.preventDefault();

                    return ajax({
                        url: url,
                        method: 'post',
                        data: data
                    }).then(this.submissionResult(true, $form), this.submissionResult(false, $form));
                }.bind(this);

            },
            submissionResult: function (isSuccess, $form) {
                return function () {
                    updateForm.replaceContent(isSuccess, $form);
                };
            }
        },
        updateForm = {
            replaceContent: function (isSuccess, $form) {
                var submissionMessage = {
                        statusClass: (isSuccess) ? '--success' : '--failure',
                        submissionMessage: (isSuccess) ? 'great success' : 'All is broken'
                    },
                    submissionHtml = template(successHtml, submissionMessage);

                fastdom.write(function () {
                    $form.addClass('email-sub__form--is-hidden');
                    $form.after(submissionHtml);
                });
            }
        },
        ui = {
            freezeHeight: function ($wrapper, reset) {
                var wrapperHeight,
                    resetHeight = function () {
                        $wrapper.css('min-height', '');
                        fastdom.read(getHeight);
                        fastdom.defer(setHeight);
                    },
                    getHeight = function () {
                        wrapperHeight = $wrapper.dim().height;
                    },
                    setHeight = function () {
                        $wrapper.css('min-height', wrapperHeight);
                    };

                if (reset) {
                    fastdom.write(resetHeight);
                } else {
                    fastdom.read(getHeight);
                    fastdom.write(setHeight);
                }
            }
        };

    return {
        init: function () {
            formInlineLabels.init(classes.inlineLabel);

            $('.' + classes.wrapper).each(function (el) {
                formSubmission.bindSubmit($('.' + classes.form, el));

                // Ensure the height of the wrapper stays the same when submitting
                ui.freezeHeight($(el));
                mediator.on('window:resize', _.debounce(function () {
                    ui.freezeHeight($(el), true);
                }, 500));
            });
        }
    };
});
