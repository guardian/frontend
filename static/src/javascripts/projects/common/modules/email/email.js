define([
    'common/utils/formInlineLabels',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'fastdom',
    'Promise',
    'common/utils/mediator',
    'lodash/functions/debounce',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/email/submissionResponse.html'
], function (
    formInlineLabels,
    bean,
    qwery,
    $,
    ajax,
    config,
    fastdom,
    Promise,
    mediator,
    debounce,
    template,
    svgs,
    successHtml
) {
    var omniture;

    /**
     * The omniture module depends on common/modules/experiments/ab, so trying to
     * require omniture directly inside an AB test gives you a circular dependency.
     *
     * This is a workaround to load omniture without making it a dependency of
     * this module, which is required by an AB test.
     */
    function getOmniture() {
        return new Promise(function (resolve) {
            if (omniture) {
                return resolve(omniture);
            }

            require('common/modules/analytics/omniture', function (omnitureM) {
                omniture = omnitureM;
                resolve(omniture);
            });
        });
    }

    var state = {
            submitting: false
        },
        classes = {
            wrapper: 'js-email-sub',
            form: 'js-email-sub__form',
            inlineLabel: 'js-email-sub__inline-label',
            textInput: 'js-email-sub__text-input'
        },
        formSubmission = {
            bindSubmit: function ($form) {
                var url = config.page.ajaxUrl + '/email';
                bean.on($form[0], 'submit', this.submitForm($form, url));
            },
            submitForm: function ($form, url) {
                return function (event) {
                    if (!state.submitting) {
                        var data = 'email=' + encodeURIComponent($('.' + classes.textInput, $form).val());

                        state.submitting = true;

                        event.preventDefault();

                        return getOmniture().then(function (omniture) {
                            omniture.trackLinkImmediate('rtrt | email form inline | footer | subscribe clicked');

                            return ajax({
                                url: url,
                                method: 'post',
                                data: data,
                                headers: {
                                    'Accept': 'application/json'
                                }
                            })
                            .then(function () {
                                omniture.trackLinkImmediate('rtrt | email form inline | footer | subscribe successful');
                            })
                            .then(this.submissionResult(true, $form))
                            .catch(function () {
                                omniture.trackLinkImmediate('rtrt | email form inline | footer | error');
                                this.submissionResult(false, $form)();
                            });
                        }.bind(this));
                    }
                }.bind(this);
            },
            submissionResult: function (isSuccess, $form) {
                return function () {
                    updateForm.replaceContent(isSuccess, $form);
                    state.submitting = false;
                };
            }
        },
        updateForm = {
            replaceContent: function (isSuccess, $form) {
                var submissionMessage = {
                        statusClass: (isSuccess) ? 'email-sub__message--success' : 'email-sub__message--failure',
                        submissionHeadline: (isSuccess) ? 'Thank you for subscribing' : 'Something went wrong',
                        submissionMessage: (isSuccess) ? 'We will send you our picks of the most important headlines tomorrow morning.' : 'Please try again.',
                        submissionIcon: (isSuccess) ? svgs('tick') : svgs('crossIcon')
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
                        fastdom.write(function () {
                            $wrapper.css('min-height', '');
                            getHeight();
                            setHeight();
                        });
                    },
                    getHeight = function () {
                        fastdom.read(function () {
                            wrapperHeight = $wrapper.dim().height;
                        });
                    },
                    setHeight = function () {
                        fastdom.defer(function () {
                            $wrapper.css('min-height', wrapperHeight);
                        });
                    };

                return function () {
                    if (reset) {
                        resetHeight();
                    } else {
                        getHeight();
                        setHeight();
                    }
                };
            },
            setIframeHeight: function (iFrameEl, callback) {
                return function () {
                    fastdom.write(function () {
                        iFrameEl.height = '';
                        iFrameEl.height = iFrameEl.contentWindow.document.body.clientHeight + 'px';
                        callback.call();
                    });
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
                var $el = $(el),
                    freezeHeight = ui.freezeHeight($el, false),
                    freezeHeightReset = ui.freezeHeight($el, true);

                formSubmission.bindSubmit($('.' + classes.form, el));

                // Ensure our form is the right height, both in iframe and outside
                (isIframed) ? ui.setIframeHeight(rootEl, freezeHeight).call() : freezeHeight.call();
                mediator.on('window:resize',
                    debounce((isIframed) ? ui.setIframeHeight(rootEl, freezeHeightReset) : freezeHeightReset, 500)
                );
            });
        }
    };
});
