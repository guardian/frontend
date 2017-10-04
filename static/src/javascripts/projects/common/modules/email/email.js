// @flow
import formInlineLabels from 'lib/formInlineLabels';
import bean from 'bean';
import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import { getUserAgent } from 'lib/detect';
import fetch from 'lib/fetch';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import { logError } from 'lib/robust';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import { inlineSvg } from 'common/views/svgs';
import successHtml from 'raw-loader!common/views/email/submissionResponse.html';
import closeHtml from 'raw-loader!common/views/ui/close-button.html';
import { getUserFromApi, isUserLoggedIn } from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';
import uniq from 'lodash/arrays/uniq';

const state = {
    submitting: false,
};

const messages = {
    defaultSuccessHeadline: 'Thank you for subscribing',
    defaultSuccessDesc: '',
};

const updateForm = {
    replaceContent(isSuccess, $form) {
        const formData = $form.data('formData');
        const submissionMessage = {
            statusClass: isSuccess
                ? 'email-sub__message--success'
                : 'email-sub__message--failure',
            submissionHeadline: isSuccess
                ? formData.customSuccessHeadline ||
                  messages.defaultSuccessHeadline
                : 'Something went wrong',
            submissionMessage: isSuccess
                ? formData.customSuccessDesc || messages.defaultSuccessDesc
                : 'Please try again.',
            submissionIcon: isSuccess
                ? inlineSvg('tick')
                : inlineSvg('crossIcon'),
        };
        const submissionHtml = template(successHtml, submissionMessage);

        fastdom.write(() => {
            $form.addClass('email-sub__form--is-hidden');
            $form.after(submissionHtml);
        });
    },
};

const handleSubmit = (isSuccess, $form) => () => {
    updateForm.replaceContent(isSuccess, $form);
    state.submitting = false;
};

const classes = {
    wrapper: 'js-email-sub',
    form: 'js-email-sub__form',
    inlineLabel: 'js-email-sub__inline-label',
    textInput: 'js-email-sub__text-input',
    listIdHiddenInput: 'js-email-sub__listid-input',
};

const removeAndRemember = (e, data) => {
    const iframe = data[0];
    const analytics = data[1];
    const currentListPrefs =
        userPrefs.get(`email-sign-up-${analytics.formType}`) || [];

    currentListPrefs.push(`${analytics.listId}`);
    userPrefs.set(
        `email-sign-up-${analytics.formType}`,
        uniq(currentListPrefs)
    );

    $(iframe).remove();

    trackNonClickInteraction(
        `rtrt | email form inline | ${analytics.formType} | ${analytics.listId} | ${analytics.signedIn} | form hidden`
    );
};

const ui = {
    updateForm(thisRootEl, el, analytics, opts) {
        const formData = $(thisRootEl).data();
        const formDisplayNameNormalText =
            (opts && opts.displayName && opts.displayName.normalText) ||
            formData.formDisplayNameNormalText ||
            false;
        const formDisplayNameAccentedText =
            (opts && opts.displayName && opts.displayName.accentedText) ||
            formData.formDisplayNameAccentedText ||
            false;
        const formTitle =
            (opts && opts.formTitle) || formData.formTitle || false;
        const formDescription =
            (opts && opts.formDescription) || formData.formDescription || false;
        const formCampaignCode =
            (opts && opts.formCampaignCode) || formData.formCampaignCode || '';
        const formSuccessHeadline =
            (opts && opts.formSuccessHeadline) || formData.formSuccessHeadline;
        const formSuccessDesc =
            (opts && opts.formSuccessDesc) || formData.formSuccessDesc;
        const removeComforter =
            (opts && opts.removeComforter) || formData.removeComforter || false;
        const formCloseButton =
            (opts && opts.formCloseButton) || formData.formCloseButton || false;
        const formSuccessEventName =
            (opts && opts.formSuccessEventName) ||
            formData.formSuccessEventName ||
            false;

        getUserFromApi(userFromId => {
            ui.updateFormForLoggedIn(userFromId, el);
        });

        fastdom.write(() => {
            if (formDisplayNameNormalText) {
                $('.js-email-sub__display-name-normal-text', el).text(
                    formDisplayNameNormalText
                );

                if (formDisplayNameAccentedText) {
                    $('.js-email-sub__display-name-accented-text', el).text(
                        formDisplayNameAccentedText
                    );
                }
            } else if (formTitle) {
                $('.js-email-sub__heading', el).text(formTitle);
            }

            if (formDescription) {
                $('.js-email-sub__description', el).text(formDescription);
            }

            if (removeComforter) {
                $('.js-email-sub__small', el).remove();
            }

            if (formCloseButton) {
                const closeButtonTemplate = {
                    closeIcon: inlineSvg('closeCentralIcon'),
                };
                const closeButtonHtml = template(
                    closeHtml,
                    closeButtonTemplate
                );

                el.append(closeButtonHtml);

                bean.on(
                    el[0],
                    'click',
                    '.js-email-sub--close',
                    removeAndRemember,
                    [thisRootEl, analytics]
                );
            }
        });

        // Cache data on the form element
        $('.js-email-sub__form', el).data('formData', {
            customSuccessEventName: formSuccessEventName,
            campaignCode: formCampaignCode,
            referrer: window.location.href,
            customSuccessHeadline: formSuccessHeadline,
            customSuccessDesc: formSuccessDesc,
        });
    },
    updateFormForLoggedIn(userFromId, el) {
        if (userFromId && userFromId.primaryEmailAddress) {
            fastdom.write(() => {
                $('.js-email-sub__inline-label', el).addClass(
                    'email-sub__inline-label--is-hidden'
                );
                $('.js-email-sub__submit-button', el).addClass(
                    'email-sub__submit-button--solo'
                );
                $('.js-email-sub__text-input', el).val(
                    userFromId.primaryEmailAddress
                );
            });
        }
    },
    freezeHeight($wrapper, reset) {
        let wrapperHeight;

        const getHeight = () => {
            fastdom.read(() => {
                wrapperHeight = $wrapper[0].clientHeight;
            });
        };

        const setHeight = () => {
            fastdom.defer(() => {
                $wrapper.css('min-height', wrapperHeight);
            });
        };

        const resetHeight = () => {
            fastdom.write(() => {
                $wrapper.css('min-height', '');
                getHeight();
                setHeight();
            });
        };

        return () => {
            if (reset) {
                resetHeight();
            } else {
                getHeight();
                setHeight();
            }
        };
    },
    setIframeHeight(iFrameEl, callback) {
        return () => {
            fastdom.write(() => {
                iFrameEl.height = '';
                iFrameEl.height = `${iFrameEl.contentWindow.document.body
                    .clientHeight}px`;
                callback.call();
            });
        };
    },
};
const formSubmission = {
    bindSubmit($form, analytics) {
        const url = '/email';
        bean.on($form[0], 'submit', this.submitForm($form, url, analytics));
    },
    submitForm($form, url, analytics) {
        /**
               * simplistic email address validation to prevent misfired
               * omniture events
               *
               * @param  {String} emailAddress
               * @return {Boolean}
               */
        const validate = emailAddress =>
            typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;

        return event => {
            const emailAddress = $(`.${classes.textInput}`, $form).val();
            const listId = $(`.${classes.listIdHiddenInput}`, $form).val();
            let analyticsInfo;

            event.preventDefault();

            if (!state.submitting && validate(emailAddress)) {
                const formData = $form.data('formData');
                const data = `email=${encodeURIComponent(
                    emailAddress
                )}&listId=${listId}&campaignCode=${formData.campaignCode}&referrer=${formData.referrer}`;

                analyticsInfo =
                    `rtrt | email form inline | ${analytics.formType} | ${analytics.listId} | ${analytics.signedIn} | ` +
                    `%action%`;

                state.submitting = true;

                return new Promise(() => {
                    if (formData.customSuccessEventName) {
                        mediator.emit(formData.customSuccessEventName);
                    }
                    trackNonClickInteraction(
                        analyticsInfo.replace('%action%', 'subscribe clicked')
                    );
                    return fetch(config.page.ajaxUrl + url, {
                        method: 'post',
                        body: data,
                        headers: {
                            Accept: 'application/json',
                        },
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(
                                    `Fetch error: ${response.status} ${response.statusText}`
                                );
                            }
                        })
                        .then(() => {
                            trackNonClickInteraction(
                                analyticsInfo.replace(
                                    '%action%',
                                    'subscribe successful'
                                )
                            );
                        })
                        .then(handleSubmit(true, $form))
                        .catch(error => {
                            logError('c-email', error);
                            trackNonClickInteraction(
                                analyticsInfo.replace('%action%', 'error')
                            );
                            handleSubmit(false, $form)();
                        });
                });
            }
        };
    },
};
const setup = (rootEl, thisRootEl, isIframed) => {
    $(`.${classes.inlineLabel}`, thisRootEl).each(el => {
        formInlineLabels.init(el, {
            textInputClass: '.js-email-sub__text-input',
            labelClass: '.js-email-sub__label',
            hiddenLabelClass: 'email-sub__label--is-hidden',
            labelEnabledClass: 'email-sub__inline-label--enabled',
        });
    });

    $(`.${classes.wrapper}`, thisRootEl).each(el => {
        const $el = $(el);
        const freezeHeight = ui.freezeHeight($el, false);
        const freezeHeightReset = ui.freezeHeight($el, true);
        const $formEl = $(`.${classes.form}`, el);
        const analytics = {
            formType: $formEl.data('email-form-type'),
            listId: $formEl.data('email-list-id'),
            signedIn: isUserLoggedIn()
                ? 'user signed-in'
                : 'user not signed-in',
        };

        formSubmission.bindSubmit($formEl, analytics);

        // If we're in an iframe, we should check whether we need to add a title and description
        // from the data attributes on the iframe (eg: allowing us to set them from composer).
        // We should also ensure our form is the right height.
        if (isIframed) {
            ui.updateForm(rootEl, $el, analytics);
            ui.setIframeHeight(rootEl, freezeHeight).call();
        } else {
            freezeHeight.call();
        }

        mediator.on(
            'window:throttledResize',
            isIframed
                ? ui.setIframeHeight(rootEl, freezeHeightReset)
                : freezeHeightReset
        );
    });
};

export default {
    updateForm: ui.updateForm,
    init(rootEl) {
        const browser = getUserAgent.browser;
        const version = getUserAgent.version;
        // If we're in lte IE9, don't run the init and adjust the footer
        if (browser === 'MSIE' && ['7', '8', '9'].includes(`${version}`)) {
            $('.js-footer__secondary').addClass(
                'l-footer__secondary--no-email'
            );
            $('.js-footer__email-container', '.js-footer__secondary').addClass(
                'is-hidden'
            );
        } else if (rootEl && rootEl.tagName === 'IFRAME') {
            // We're loading through the iframe
            // We can listen for a lazy load or reload to catch an update
            setup(rootEl, rootEl.contentDocument.body, true);
            bean.on(rootEl, 'load', () => {
                setup(rootEl, rootEl.contentDocument.body, true);
            });
        } else {
            setup(rootEl, rootEl || document, false);
        }
    },
};
