define([
    'lib/formInlineLabels',
    'bean',
    'bonzo',
    'qwery',
    'fastdom',
    'Promise',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/fetch',
    'lib/mediator',
    'lib/template',
    'lib/robust',
    'common/modules/analytics/google',
    'lodash/collections/contains',
    'common/views/svgs',
    'raw-loader!common/views/email/submissionResponse.html',
    'raw-loader!common/views/ui/close-button.html',
    'common/modules/identity/api',
    'common/modules/user-prefs',
    'lodash/arrays/uniq'
], function (
    formInlineLabels,
    bean,
    bonzo,
    qwery,
    fastdom,
    Promise,
    $,
    config,
    detect,
    fetch,
    mediator,
    template,
    robust,
    googleAnalytics,
    contains,
    svgs,
    successHtml,
    closeHtml,
    Id,
    userPrefs,
    uniq
) {

    var state = {
        submitting: false
    };

    var messages = {
        defaultSuccessHeadline: 'Thank you for subscribing',
        defaultSuccessDesc: ''
    };

    var updateForm = {
        replaceContent: function (isSuccess, $form) {
            var formData = $form.data('formData'),
                submissionMessage = {
                    statusClass: (isSuccess) ? 'email-sub__message--success' : 'email-sub__message--failure',
                    submissionHeadline: (isSuccess) ? formData.customSuccessHeadline || messages.defaultSuccessHeadline : 'Something went wrong',
                    submissionMessage: (isSuccess) ? formData.customSuccessDesc || messages.defaultSuccessDesc : 'Please try again.',
                    submissionIcon: (isSuccess) ? svgs('tick') : svgs('crossIcon')
                },
                submissionHtml = template(successHtml, submissionMessage);

            fastdom.write(function () {
                $form.addClass('email-sub__form--is-hidden');
                $form.after(submissionHtml);
            });
        }
    };

    function handleSubmit(isSuccess, $form) {
        return function () {
            updateForm.replaceContent(isSuccess, $form);
            state.submitting = false;
        };
    }

    var classes = {
            wrapper: 'js-email-sub',
            form: 'js-email-sub__form',
            inlineLabel: 'js-email-sub__inline-label',
            textInput: 'js-email-sub__text-input',
            listIdHiddenInput: 'js-email-sub__listid-input'
        },
        removeAndRemember = function (e, data) {
            var iframe = data[0],
                analytics = data[1],
                currentListPrefs = userPrefs.get('email-sign-up-' + analytics.formType) || [];

            currentListPrefs.push(analytics.listId + '');
            userPrefs.set('email-sign-up-' + analytics.formType, uniq(currentListPrefs));

            $(iframe).remove();

            googleAnalytics.trackNonClickInteraction('rtrt | email form inline | ' + analytics.formType + ' | ' + analytics.listId + ' | ' + analytics.signedIn + ' | form hidden');

        },
        ui = {
            updateForm: function (thisRootEl, el, analytics, opts) {
                var formData = $(thisRootEl).data(),
                    formDisplayNameNormalText = (opts && opts.displayName && opts.displayName.normalText) || formData.formDisplayNameNormalText || false,
                    formDisplayNameAccentedText = (opts && opts.displayName && opts.displayName.accentedText) || formData.formDisplayNameAccentedText || false,
                    formTitle = (opts && opts.formTitle) || formData.formTitle || false,
                    formDescription = (opts && opts.formDescription) || formData.formDescription || false,
                    formCampaignCode = (opts && opts.formCampaignCode) || formData.formCampaignCode || '',
                    formSuccessHeadline = (opts && opts.formSuccessHeadline) || formData.formSuccessHeadline,
                    formSuccessDesc = (opts && opts.formSuccessDesc) || formData.formSuccessDesc,
                    removeComforter = (opts && opts.removeComforter) || formData.removeComforter || false,
                    formCloseButton = (opts && opts.formCloseButton) || formData.formCloseButton || false,
                    formSuccessEventName = (opts && opts.formSuccessEventName) || formData.formSuccessEventName || false;

                Id.getUserFromApi(function (userFromId) {
                    ui.updateFormForLoggedIn(userFromId, el);
                });

                fastdom.write(function () {
                    if (formTitle) {
                        $('.js-email-sub__heading', el).text(formTitle);
                    }

                    if (formDisplayNameNormalText) {
                        $('.js-email-sub__display-name-normal-text', el).text(formDisplayNameNormalText);
                    }

                    if (formDisplayNameAccentedText) {
                        $('.js-email-sub__display-name-accented-text', el).text(formDisplayNameAccentedText);
                    }

                    if (formDescription) {
                        $('.js-email-sub__description', el).text(formDescription);
                    }

                    if (removeComforter) {
                        $('.js-email-sub__small', el).remove();
                    }

                    if (formCloseButton) {
                        var closeButtonTemplate = {
                            closeIcon: svgs('closeCentralIcon')
                        },
                        closeButtonHtml = template(closeHtml, closeButtonTemplate);

                        el.append(closeButtonHtml);

                        bean.on(el[0], 'click', '.js-email-sub--close', removeAndRemember, [thisRootEl, analytics]);
                    }
                });

                // Cache data on the form element
                $('.js-email-sub__form', el).data('formData', {
                    customSuccessEventName: formSuccessEventName,
                    campaignCode: formCampaignCode,
                    referrer: window.location.href,
                    customSuccessHeadline: formSuccessHeadline,
                    customSuccessDesc: formSuccessDesc
                });

            },
            updateFormForLoggedIn: function (userFromId, el) {
                if (userFromId && userFromId.primaryEmailAddress) {
                    fastdom.write(function () {
                        $('.js-email-sub__inline-label', el).addClass('email-sub__inline-label--is-hidden');
                        $('.js-email-sub__submit-button', el).addClass('email-sub__submit-button--solo');
                        $('.js-email-sub__text-input', el).val(userFromId.primaryEmailAddress);
                    });
                }
            },
            freezeHeight: function ($wrapper, reset) {
                var wrapperHeight,
                    getHeight = function () {
                        fastdom.read(function () {
                            wrapperHeight = $wrapper[0].clientHeight;
                        });
                    },
                    setHeight = function () {
                        fastdom.defer(function () {
                            $wrapper.css('min-height', wrapperHeight);
                        });
                    },
                    resetHeight = function () {
                        fastdom.write(function () {
                            $wrapper.css('min-height', '');
                            getHeight();
                            setHeight();
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
                        listId = $('.' + classes.listIdHiddenInput, $form).val(),
                        analyticsInfo;

                    event.preventDefault();

                    if (!state.submitting && validate(emailAddress)) {
                        var formData = $form.data('formData'),
                            data =  'email=' + encodeURIComponent(emailAddress) +
                                    '&listId=' + listId +
                                    '&campaignCode=' + formData.campaignCode +
                                    '&referrer=' + formData.referrer;

                        analyticsInfo = 'rtrt | email form inline | '
                                        + analytics.formType + ' | '
                                        + analytics.listId + ' | '
                                        + analytics.signedIn + ' | '
                                        + '%action%';

                        state.submitting = true;

                        return new Promise(function () {
                            if (formData.customSuccessEventName) {
                                mediator.emit(formData.customSuccessEventName);
                            }
                            googleAnalytics.trackNonClickInteraction(analyticsInfo.replace('%action%', 'subscribe clicked'));
                            return fetch(config.page.ajaxUrl + url, {
                                method: 'post',
                                body: data,
                                headers: {
                                    'Accept': 'application/json'
                                }
                            })
                            .then(function (response) {
                                if (!response.ok) {
                                    throw new Error('Fetch error: ' + response.status + ' ' + response.statusText);
                                }
                            })
                            .then(function () {
                                googleAnalytics.trackNonClickInteraction(analyticsInfo.replace('%action%', 'subscribe successful'));
                            })
                            .then(handleSubmit(true, $form))
                            .catch(function (error) {
                                robust.log('c-email', error);
                                googleAnalytics.trackNonClickInteraction(analyticsInfo.replace('%action%', 'error'));
                                handleSubmit(false, $form)();
                            });
                        });
                    }
                };
            }
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
                    $formEl = $('.' + classes.form, el),
                    analytics = {
                        formType: $formEl.data('email-form-type'),
                        listId: $formEl.data('email-list-id'),
                        signedIn: (Id.isUserLoggedIn()) ? 'user signed-in' : 'user not signed-in'
                    };

                formSubmission.bindSubmit($formEl, analytics);

                // If we're in an iframe, we should check whether we need to add a title and description
                // from the data attributes on the iframe (eg: allowing us to set them from composer)
                if (isIframed) {
                    ui.updateForm(rootEl, $el, analytics);
                }

                // Ensure our form is the right height, both in iframe and outside
                (isIframed) ? ui.setIframeHeight(rootEl, freezeHeight).call() : freezeHeight.call();

                mediator.on('window:throttledResize',
                    (isIframed) ? ui.setIframeHeight(rootEl, freezeHeightReset) : freezeHeightReset
                );
            });
        };

    return {
            updateForm: ui.updateForm,
            init: function (rootEl) {
                var browser = detect.getUserAgent.browser,
                    version = detect.getUserAgent.version;
                // If we're in lte IE9, don't run the init and adjust the footer
                if (browser === 'MSIE' && contains(['7','8','9'], version + '')) {
                    $('.js-footer__secondary').addClass('l-footer__secondary--no-email');
                    $('.js-footer__email-container', '.js-footer__secondary').addClass('is-hidden');
                } else {
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
            }
        };
});
