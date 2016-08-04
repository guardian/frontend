// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

define([
    'bean',
    'qwery',
    'reqwest',
    'fastdom',
    'common/utils/$'
], function (
    bean,
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
        clearErrorMessages();
        var errorMessage = 'Sorry, an error has occurred, please refresh the page and try again';
        return fastdom.write(function () {
            var insertionPoint = $.ancestor(buttonEl, 'email-subscription');
            if (qwery('.form__error', insertionPoint).length < 1) {
                var errorMessageDiv = document.createElement('div');
                errorMessageDiv.innerHTML = errorMessage;
                errorMessageDiv.classList.add('form__error');
                insertionPoint.appendChild(errorMessageDiv);
            }
        });
    }

    // clear any error messages from the page
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
                $.ancestor(buttonEl, 'email-subscription').classList.add('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        } else if (subscriptionState === false) {
            fastdom.write(function () {
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                $.ancestor(buttonEl, 'email-subscription').classList.remove('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        } else {
            renderErrorMessage(buttonEl);
        }
    }

    function updateSaveButton(buttonEl) {
        buttonEl.innerHTML = 'Save';
        buttonEl.disabled = false;
        renderErrorMessage(buttonEl);
    }

    function updateButton(buttonEl, subscriptionState) {
        if (buttonEl.classList.contains('email-subscription__button')) {
            updateSubscriptionButton(buttonEl, subscriptionState);
        } else {
            updateSaveButton(buttonEl);
        }
    }

    function getHTMLPref() {
        if(qwery('#htmlPreference_HTML')[0].checked) {
          return 'HTML';
      } else if(qwery('#htmlPreference_Text')[0].checked) {
          return 'Text';
      } else {
          return '';
      }
    }

    function generateFormQueryString(buttonEl) {
        var formEl = $.ancestor(buttonEl, 'form');
        var csrfToken = (formEl.elements.csrfToken.value).toString();
        var buttonVal = buttonEl.value.toString() || '';
        var htmlPreference = getHTMLPref() || '';
        return encodeFormData(csrfToken, buttonVal, htmlPreference);
    }

    return {
        init: function () {
            enhanceEmailPreferences();
        }
    };
});
