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
    function useReqwest(buttonEl) {
        fastdom.write(function () {
            buttonEl.type = 'button';
        });
        bean.on(buttonEl, 'click', function () {
            buttonEl.disabled = true;
            buttonEl.classList.add('loading');
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
                        // Why array.length rather than typeof; there are multiple circumstances where the value could be undefined:
                        // nothing came back at all
                        // stuff came back but that one field is undefined
                        // the data came back in the format expected as above, but with the subscribeTo value undefined
                        if (response.subscriptions.length < 1) {
                            // response came back as expected, but the user is not subscribed:
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
        $.forEachElement('.email-subscription__button', useReqwest);
    }

    function encodeFormData(csrfToken, buttonVal, htmlPreference) {
        return 'csrfToken=' + encodeURIComponent(csrfToken) + '&' +
        'addEmailSubscription=' + encodeURIComponent(buttonVal) + '&' +
        'htmlPreference=' + encodeURIComponent(htmlPreference);
    }

    function renderErrorMessage(buttonEl) {
        // appends an error message on the parent div of the button
        var errorMessage = 'Sorry, an error has occurred, please refresh the page and try again';
        return fastdom.write(function () {
            var insertionPoint = $.ancestor(buttonEl, 'email-subscription');
            // Only append an error message once for each email subscription DIV
            if (qwery('.form__error', insertionPoint).length < 1) {
                var errorMessageDiv = document.createElement('div');
                errorMessageDiv.innerHTML = errorMessage;
                errorMessageDiv.classList.add('form__error');
                insertionPoint.appendChild(errorMessageDiv);
            }
        });
    }

    function updateButton(buttonEl, subscriptionState) {
        // do this after successful POST request to update the appearance and value of the button
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
        var buttonVal = buttonEl.value.toString();
        var htmlPreference = getHTMLPref() || '';
        return encodeFormData(csrfToken, buttonVal, htmlPreference);

    }

    return {
        init: function () {
            enhanceEmailPreferences();
        }
    };
});
