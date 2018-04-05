// @flow
import formInlineLabels from 'lib/formInlineLabels';
import bean from 'bean';
import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import { getUserAgent } from 'lib/detect';
import fetch from 'lib/fetch';
import mediator from 'lib/mediator';
import { logError } from 'lib/robust';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import { inlineSvg } from 'common/views/svgs';
import { getUserFromApi, isUserLoggedIn } from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';
import uniq from 'lodash/arrays/uniq';
import envelope from 'svgs/icon/envelope.svg';
import crossIcon from 'svgs/icon/cross.svg';

import type { IdentityUser } from 'common/modules/identity/api';
import type { bonzo } from 'bonzo';

type Analytics = {
    formType: string,
    listId: string,
    signedIn: string,
};

const state = {
    submitting: false,
};

const messages = {
    defaultSuccessHeadline: 'Check your Inbox to confirm subscription',
    defaultSuccessDesc: '',
};

const classes = {
    wrapper: 'js-email-sub',
    form: 'js-email-sub__form',
    inlineLabel: 'js-email-sub__inline-label',
    textInput: 'js-email-sub__text-input',
    dummyInput: 'js-email-sub__text-name',
    listNameHiddenInput: 'js-email-sub__listname-input',
};

const replaceContent = (isSuccess: boolean, $form: bonzo): void => {
    const formData = $form.data('formData');
    const statusClass = isSuccess
        ? 'email-sub__message--success'
        : 'email-sub__message--failure';
    const submissionHeadline = isSuccess
        ? formData.customSuccessHeadline || messages.defaultSuccessHeadline
        : 'Something went wrong';
    const submissionMessage = isSuccess
        ? formData.customSuccessDesc || messages.defaultSuccessDesc
        : 'Please try again.';
    const submissionIcon = isSuccess ? envelope.markup : crossIcon.markup;
    const submissionHtml = `
        <div class="email-sub__message ${
            statusClass
        }" role="alert" aria-live="assertive">
            ${submissionIcon}
            <h3 class="email-sub__message__headline">${submissionHeadline}</h3>
            <p class="email-sub__message__description">${submissionMessage}</p>
        </div>`;

    fastdom.write(() => {
        $form.addClass('email-sub__form--is-hidden');
        $form.after(submissionHtml);
    });
};

const removeAndRemember = (
    e: Event,
    { iframe, analytics }: { iframe: HTMLElement, analytics: Analytics }
): void => {
    const currentListPrefs =
        userPrefs.get(`email-sign-up-${analytics.formType}`) || [];

    currentListPrefs.push(`${analytics.listId}`);
    userPrefs.set(
        `email-sign-up-${analytics.formType}`,
        uniq(currentListPrefs)
    );

    $(iframe).remove();

    trackNonClickInteraction(
        `rtrt | email form inline | ${analytics.formType} | ${
            analytics.listId
        } | ${analytics.signedIn} | form hidden`
    );
};

const updateFormForLoggedIn = (
    userFromId: IdentityUser,
    el: HTMLElement
): void => {
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
};

const updateForm = (
    thisRootEl: HTMLElement,
    $el: bonzo,
    analytics: Analytics
): void => {
    const formData = $(thisRootEl).data();
    const formDisplayNameNormalText =
        formData.formDisplayNameNormalText || false;
    const formDisplayNameAccentedText =
        formData.formDisplayNameAccentedText || false;
    const formTitle = formData.formTitle || false;
    const formDescription = formData.formDescription || false;
    const formCampaignCode = formData.formCampaignCode || '';
    const formSuccessHeadline = formData.formSuccessHeadline;
    const formSuccessDesc = formData.formSuccessDesc;
    const removeComforter = formData.removeComforter || false;
    const formCloseButton = formData.formCloseButton || false;
    const formSuccessEventName = formData.formSuccessEventName || false;

    getUserFromApi(userFromId => {
        updateFormForLoggedIn(userFromId, $el);
    });

    fastdom.write(() => {
        if (formDisplayNameNormalText) {
            $('.js-email-sub__display-name-normal-text', $el).text(
                formDisplayNameNormalText
            );

            if (formDisplayNameAccentedText) {
                $('.js-email-sub__display-name-accented-text', $el).text(
                    formDisplayNameAccentedText
                );
            }
        } else if (formTitle) {
            $('.js-email-sub__heading', $el).text(formTitle);
        }

        if (formDescription) {
            $('.js-email-sub__description', $el).text(formDescription);
        }

        if (removeComforter) {
            $('.js-email-sub__small', $el).remove();
        }

        if (formCloseButton) {
            const closeButtonHtml = `
                <button class="email-sub__close js-email-sub--close" data-link-name="hide">
                    <span class="email-sub__hidden">Close</span>
                    <span class="email-sub__close-icon">
                        ${inlineSvg('closeCentralIcon')}
                    </span>
                </button>`;

            $el.append(closeButtonHtml);

            bean.on(
                $el[0],
                'click',
                '.js-email-sub--close',
                removeAndRemember,
                {
                    iframe: thisRootEl,
                    analytics,
                }
            );
        }
    });

    // Cache data on the form element
    $('.js-email-sub__form', $el).data('formData', {
        customSuccessEventName: formSuccessEventName,
        campaignCode: formCampaignCode,
        referrer: window.location.href,
        customSuccessHeadline: formSuccessHeadline,
        customSuccessDesc: formSuccessDesc,
    });
};

const heightSetter = ($wrapper: bonzo, reset: boolean): (() => void) => {
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
};

const setIframeHeight = (
    iFrameEl: HTMLIFrameElement,
    callback: () => void
): (() => void) => () => {
    fastdom.write(() => {
        iFrameEl.height = '';
        iFrameEl.height = `${
            iFrameEl.contentWindow.document.body.clientHeight
        }px`;
        callback();
    });
};

const handleSubmit = (isSuccess: boolean, $form: bonzo): (() => void) => () => {
    replaceContent(isSuccess, $form);
    state.submitting = false;
};

const submitForm = (
    $form: bonzo,
    url: string,
    analytics: Analytics
): (Event => ?Promise<any>) => {
    // simplistic email address validation to prevent misfired omniture events
    const validate = (emailAddress: string): boolean =>
        emailAddress.includes('@');

    return event => {
        const emailAddress = $(`.${classes.textInput}`, $form).val();
        const csrfToken = $(`input[name=csrfToken]`, $form).val();
        const dummy = $(`.${classes.dummyInput}`, $form).val();
        const listName = $(`.${classes.listNameHiddenInput}`, $form);

        let analyticsInfo;

        event.preventDefault();
        if (!state.submitting && validate(emailAddress)) {
            const formData = $form.data('formData');
            const data = `email=${encodeURIComponent(
                emailAddress
            )}&name=${encodeURIComponent(dummy)}&campaignCode=${
                formData.campaignCode
            }&referrer=${formData.referrer}&csrfToken=${encodeURIComponent(
                csrfToken
            )}&listName=${listName.val()}`;

            analyticsInfo = `rtrt | email form inline | ${
                analytics.formType
            } | ${analytics.signedIn} | %action%`;

            state.submitting = true;

            return new Promise(() => {
                if (formData.customSuccessEventName) {
                    mediator.emit(formData.customSuccessEventName);
                }
                trackNonClickInteraction(
                    analyticsInfo.replace('%action%', 'subscribe clicked')
                );
                return fetch(config.get('page.ajaxUrl') + url, {
                    method: 'post',
                    body: data,
                    headers: {
                        Accept: 'application/json',
                    },
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(
                                `Fetch error: ${response.status} ${
                                    response.statusText
                                }`
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
};

const bindSubmit = ($form: bonzo, analytics: Analytics): void => {
    const url = '/email';

    bean.on($form[0], 'submit', submitForm($form, url, analytics));
};

const setup = (
    rootEl: ?HTMLElement | ?Document,
    iframeEl: ?HTMLIFrameElement
): void => {
    $(`.${classes.inlineLabel}`, rootEl).each(el => {
        formInlineLabels.init(el, {
            textInputClass: '.js-email-sub__text-input',
            labelClass: '.js-email-sub__label',
            hiddenLabelClass: 'email-sub__label--is-hidden',
            labelEnabledClass: 'email-sub__inline-label--enabled',
        });
    });

    $(`.${classes.wrapper}`, rootEl).each(el => {
        const $el = $(el);
        const freezeHeight = heightSetter($el, false);
        const resetHeight = heightSetter($el, true);
        const $formEl = $(`.${classes.form}`, el);
        const analytics = {
            formType: $formEl.data('email-form-type'),
            listId: $formEl.data('email-list-id'),
            signedIn: isUserLoggedIn()
                ? 'user signed-in'
                : 'user not signed-in',
        };
        let onResize;

        bindSubmit($formEl, analytics);

        // If we're in an iframe, we should check whether we need to add a title and description
        // from the data attributes on the iframe (eg: allowing us to set them from composer).
        // We should also ensure our form is the right height.
        if (iframeEl) {
            updateForm(iframeEl, $el, analytics);
            setIframeHeight(iframeEl, freezeHeight)();
            onResize = setIframeHeight(iframeEl, resetHeight);
        } else {
            freezeHeight();
            onResize = resetHeight;
        }

        mediator.on('window:throttledResize', onResize);
    });
};

const initEmail = (iframeEl?: HTMLIFrameElement): void => {
    // If we're in <= IE9, don't run the setup and adjust the footer
    if (
        typeof getUserAgent === 'object' &&
        getUserAgent.browser === 'MSIE' &&
        ['7', '8', '9'].includes(getUserAgent.version)
    ) {
        $('.js-footer__secondary').addClass('l-footer__secondary--no-email');
        $('.js-footer__email-container', '.js-footer__secondary').addClass(
            'is-hidden'
        );
    } else if (iframeEl && iframeEl.tagName === 'IFRAME') {
        // We're loading through the iframe
        // We can listen for a lazy load or reload to catch an update
        if (iframeEl.contentDocument) {
            setup(iframeEl.contentDocument.body, iframeEl);
            bean.on(iframeEl, 'load', () => {
                if (iframeEl && iframeEl.contentDocument) {
                    setup(iframeEl.contentDocument.body, iframeEl);
                }
            });
        }
    } else {
        setup(document);
    }
};

export { initEmail };
