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
    'text!common/views/email/submissionResponse.html',
    'common/utils/robust'
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
    successHtml,
    robust
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

    function handleSubmit(isSuccess, $form) {
        return function () {
            updateForm.replaceContent(isSuccess, $form);
            state.submitting = false;
        };
    }

    var state = {
            submitting: false
        },
        classes = {
            wrapper: 'js-email-sub',
            form: 'js-email-sub__form',
            inlineLabel: 'js-email-sub__inline-label',
            textInput: 'js-email-sub__text-input',
            listIdHiddenInput: 'js-email-sub__listid-input'
        },
        setup = function (rootEl, thisRootEl, isIframed) {
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
                    freezeHeightReset = ui.freezeHeight($el, true),
                    $formEl = $('.' + classes.form, el);

                formSubmission.bindSubmit($formEl, {
                    formType: $formEl.data('email-form-type'),
                    listId: $formEl.data('email-list-id')
                });

                // If we're in an iframe, we should check whether we need to add a title and description
                // from the data attributes on the iframe (eg: allowing us to set them from composer)
                if (isIframed) {
                    ui.updateForm(rootEl, $el);
                }

                // Ensure our form is the right height, both in iframe and outside
                (isIframed) ? ui.setIframeHeight(rootEl, freezeHeight).call() : freezeHeight.call();

                mediator.on('window:resize',
                    debounce((isIframed) ? ui.setIframeHeight(rootEl, freezeHeightReset) : freezeHeightReset, 500)
                );
            });
        },
        formSubmission = {
            bindSubmit: function ($form, analytics) {
                var url = '/email';
                bean.on($form[0], 'submit', this.submitForm($form, url, analytics));
            },
            submitForm: function ($form, url, analytics) {
                /**
                 * simplistic email address validation to prevent misfired
                 * omniture events
                 *
                 * @param  {String} emailAddress
                 * @return {Boolean}
                 */
                function validate(emailAddress) {
                    return typeof emailAddress === 'string' &&
                           emailAddress.indexOf('@') > -1;
                }

                return function (event) {
                    var emailAddress = $('.' + classes.textInput, $form).val(),
                        listId = $('.' + classes.listIdHiddenInput, $form).val();

                    event.preventDefault();

                    if (!state.submitting && validate(emailAddress)) {
                        var formData = $form.data('formData'),
                            data =  'email=' + encodeURIComponent(emailAddress) +
                                    '&listId=' + listId +
                                    '&campaignCode=' + formData.campaignCode +
                                    '&referrer=' + formData.referrer;

                        state.submitting = true;

                        return getOmniture().then(function (omniture) {
                            omniture.trackLinkImmediate('rtrt | email form inline | ' + analytics.formType + ' | ' + analytics.listId + ' | subscribe clicked');

                            return ajax({
                                url: url,
                                method: 'post',
                                data: data,
                                headers: {
                                    'Accept': 'application/json'
                                }
                            })
                            .then(function () {
                                omniture.trackLinkImmediate('rtrt | email form inline | ' + analytics.formType + ' | ' + analytics.listId + ' | subscribe successful');
                            })
                            .then(handleSubmit(true, $form))
                            .catch(function (error) {
                                robust.log('c-email', error);
                                omniture.trackLinkImmediate('rtrt | email form inline | ' + analytics.formType + ' | ' + analytics.listId + ' | error');
                                handleSubmit(false, $form)();
                            });
                        });
                    }
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
            updateForm: function (thisRootEl, el, opts) {
                var formData = $(thisRootEl).data(),
                    formTitle = (opts && opts.formTitle) || formData.formTitle || false,
                    formDescription = (opts && opts.formDescription) || formData.formDescription || false,
                    formCampaignCode = (opts && opts.formCampaignCode) || formData.formCampaignCode || '',
                    removeComforter = (opts && opts.removeComforter) || formData.removeComforter || false;

                fastdom.write(function () {
                    if (formTitle) {
                        $('.js-email-sub__heading', el).text(formTitle);
                    }

                    if (formDescription) {
                        $('.js-email-sub__description', el).text(formDescription);
                    }

                    if (removeComforter) {
                        $('.js-email-sub__small', el).remove();
                    }
                });

                // Cache data on the form element
                $('.js-email-sub__form', el).data('formData', {
                    campaignCode: formCampaignCode,
                    referrer: window.location.href
                });

            },
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
                            wrapperHeight = $wrapper[0].clientHeight;
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
            updateForm: ui.updateForm,
            init: function (rootEl) {

                // We're loading through the iframe
                if (rootEl && rootEl.tagName === 'IFRAME') {
                    // We can listen for a lazy load or reload to catch an update
                    setup(rootEl, rootEl.contentDocument.body, true);
                    bean.on(rootEl, 'load', function () {
                        setup(rootEl, rootEl.contentDocument.body, true);
                    });

                } else {
                    setup(rootEl, rootEl || document, false);
                }

            }
        };
});
