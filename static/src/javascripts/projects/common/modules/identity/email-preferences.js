// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

define([
    'bean',
    'bonzo',
    'qwery',
    'reqwest',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    bonzo,
    qwery,
    reqwest,
    fastdom,
    $
) {
    function reqwestEmailSubscriptionUpdate(buttonEl) {
        bean.on(buttonEl, 'click', function () {
            buttonEl.disabled = true;
            buttonEl.innerHTML = 'Loading...';
            var formQueryString = generateFormQueryString(buttonEl);
            reqwest({
                url: '/email-prefs',
                method: 'POST',
                data: formQueryString,
                error: function () {
                    renderErrorMessage(buttonEl);
                },
                success: function (response) {
                    var subscriptionState;
                    if (response && response.subscriptions && response.subscriptions.length) {
                        subscriptionState = response.subscriptions[0].subscribedTo;
                    }
                    try {
                        if (response.subscriptions.length < 1) {
                            subscriptionState = false;
                        } else {
                            subscriptionState = response.subscriptions[0].subscribedTo;
                        }
                    } catch (err) {
                        renderErrorMessage(buttonEl);
                    } finally {
                        updateButton(buttonEl, subscriptionState);
                    }
                }
            });
        });
    }

    function enhanceEmailPreferences() {
        $.forEachElement('.email-subscription__button', reqwestEmailSubscriptionUpdate);
        $.forEachElement('.save__button', reqwestEmailSubscriptionUpdate);
    }

    function encodeFormData(csrfToken, buttonVal, htmlPreference) {
        return 'csrfToken=' + encodeURIComponent(csrfToken) + '&' +
        'addEmailSubscription=' + encodeURIComponent(buttonVal) + '&' +
        'htmlPreference=' + encodeURIComponent(htmlPreference);
    }

    function renderErrorMessage(buttonEl) {
        return fastdom.write(function () {
            clearErrorMessages();
            var errorMessage = bonzo(bonzo.create(
                '<div class="form__error">' +
                    'Sorry, an error has occurred, please refresh the page and try again' +
                '</div>'
            ));
            bonzo(errorMessage).insertAfter(buttonEl.parentNode);
        });
    }

    function clearErrorMessages() {
        if (qwery('.form__error')) {
            $.forEachElement('.form__error', function (errorEl) {
                errorEl.remove();
            });
        }
    }

    function updateSubscriptionButton(buttonEl, subscriptionState) {
        var buttonVal = buttonEl.value;
        if (subscriptionState === true) {
            fastdom.write(function () {
                buttonEl.value = 'unsubscribe-' + buttonVal;
                buttonEl.innerHTML = 'Unsubscribe';
                bonzo($.ancestor(buttonEl, 'email-subscription')).addClass('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        } else if (subscriptionState === false) {
            fastdom.write(function () {
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                bonzo($.ancestor(buttonEl, 'email-subscription')).removeClass('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        } else {
            renderErrorMessage(buttonEl);
        }
    }

    function updateSaveButton(buttonEl) {
        buttonEl.innerHTML = 'Save';
        buttonEl.disabled = false;
    }

    function updateButton(buttonEl, subscriptionState) {
        if (bonzo(buttonEl).hasClass('email-subscription__button')) {
            updateSubscriptionButton(buttonEl, subscriptionState);
        } else {
            updateSaveButton(buttonEl);
        }
    }

    function generateFormQueryString(buttonEl) {
        var formEl = $.ancestor(buttonEl, 'form');
        var csrfToken = (formEl.elements.csrfToken.value).toString();
        var buttonVal = buttonEl.value.toString() || '';
        var htmlPreference = $('[name="htmlPreference"]:checked').val();
        return encodeFormData(csrfToken, buttonVal, htmlPreference);
    }

    return {
        init: function () {
            enhanceEmailPreferences();
        }
    };
});
