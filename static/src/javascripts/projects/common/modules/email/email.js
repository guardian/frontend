define([
    'common/utils/formInlineLabels',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/ajax-promise',
    'fastdom',
    'common/utils/mediator',
    'lodash/functions/debounce',
    'common/utils/template',
    'text!common/views/email/submissionResponse.html'
], function (
    formInlineLabels,
    bean,
    qwery,
    $,
    ajax,
    fastdom,
    mediator,
    debounce,
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
                    var data = 'email=' + encodeURIComponent($('.' + classes.textInput, $form).val());

                    require('common/modules/analytics/omniture', function (omniture) {
                        omniture.trackLinkImmediate('rtrt | email form inline | footer | subscribe clicked');
                    });

                    event.preventDefault();

                    return ajax({
                        url: url,
                        method: 'post',
                        data: data,
                        headers: {
                            'Accept': 'application/json'
                        }
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
                        statusClass: (isSuccess) ? 'email-sub__message--success' : 'email-sub__message--failure',
                        submissionHeadline: (isSuccess) ? 'Thank you for subscribing' : 'Something went wrong',
                        submissionMessage: (isSuccess) ? 'We will send you our picks of the most important headlines tomorrow morning.' : 'Please try again.'
                    },
                    submissionHtml = template(successHtml, submissionMessage);

                fastdom.write(function () {
                    $form.addClass('email-sub__form--is-hidden');
                    $form.after(submissionHtml);
                });

                if (isSuccess) {
                    require('common/modules/analytics/omniture', function (omniture) {
                        omniture.trackLinkImmediate('rtrt | email form inline | footer | subscribe successful');
                    });
                }
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

                return function () {
                    if (reset) {
                        fastdom.write(resetHeight);
                    } else {
                        fastdom.read(getHeight);
                        fastdom.write(setHeight);
                    }
                };
            },
            setIframeHeight: function (iFrameEl) {
                return function () {
                    iFrameEl.height = '';
                    iFrameEl.height = iFrameEl.contentWindow.document.body.clientHeight + 'px';
                };
            }
        };

    return {
        // eg: rootEl can be a specific container or an iframe contentDocument
        init: function (rootEl) {
            var isIframed = rootEl && rootEl.tagName === 'IFRAME',
                thisRootEl = (isIframed) ? rootEl.contentDocument.body : rootEl || document;

            $('.' + classes.inlineLabel, thisRootEl).each(function (el) {
                formInlineLabels.init(el, {
                    textInputClass: '.js-email-sub__text-input',
                    labelClass: '.js-email-sub__label',
                    hiddenLabelClass: 'email-sub__label--is-hidden',
                    labelEnabledClass: 'email-sub__inline-label--enabled'
                });
            });

            $('.' + classes.wrapper, thisRootEl).each(function (el) {
                formSubmission.bindSubmit($('.' + classes.form, el));

                // Ensure the height of the wrapper stays the same when submitting
                ui.freezeHeight($(el)).apply();
                mediator.on('window:resize', debounce(ui.freezeHeight($(el), true), 500));
            });

            if (isIframed) {
                ui.setIframeHeight(rootEl).apply();
                mediator.on('window:resize', debounce(ui.setIframeHeight(rootEl), 500));
            }
        }
    };
});
