// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh

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
        bean.on(buttonEl, 'click', function () {
            var formQueryString = submitFormData(buttonEl);
            reqwest({
                url: '/email-prefs',
                method: 'POST',
                data: formQueryString,
                error: function (err) {
                    // TODO: display the error
                },
                success: function (response) {
                    var subscriptionState;
                    // lets be super careful of falsy values... yay JavaScript!
                    try {
                        // Why array.length rather than typeof; there are multiple circumstances where the value could be undefined:
                        // nothing came back at all
                        // stuff came back but that one field is undefined
                        // the data came back in the format expected as above, but with the subscribeTo value undefined
                        if (response.subscriptions.length < 1) {
                            // response can back as expected, but the user is not subscribed:
                            subscriptionState = false;
                        } else {
                            subscriptionState = response.subscriptions[0].subscribedTo;
                        }
                    } catch (err) {
                        console.log(err.message);
                    } finally {
                        updateButton(buttonEl, subscriptionState);
                    }
                }
            });
        });
    }

    function addButtonClickEvents() {
        $.forEachElement('.email-subscription__button', useReqwest);
    }

    function encodeFormData(csrfToken, buttonVal, htmlPreference) {
        // reqwest.toQueryString()
        return 'csrfToken=' + csrfToken + '&' +
        'addEmailSubscription=' + buttonVal + '&' +
        'htmlPreference=' + htmlPreference;
    }

    function updateButton(buttonEl, subscriptionState) {
        // do this after successful POST request to update the appearance and value of the button
        var buttonVal = buttonEl.value;
        if (subscriptionState === true) {
            fastdom.write(function () {
                buttonEl.value = 'unsubscribe-' + buttonVal;
                buttonEl.innerHTML = 'Unsubscribe';
                $.ancestor(buttonEl, 'email-subscription').classList.add('email-subscription--subscribed');
            });
        } else if (subscriptionState === false) {
            fastdom.write(function () {
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                $.ancestor(buttonEl, 'email-subscription').classList.remove('email-subscription--subscribed');
            });
        } else {
            throw('Something odd has happened');
        }
    }

    function getHTMLPref() {
        if(qwery('#htmlPreference_HTML')[0].checked) {
          return 'HTML';
      } else if(qwery('#htmlPreference_Text')[0].checked) {
          return 'Text';
        }
    }

    function submitFormData(buttonEl) {
        var formEl = $.ancestor(buttonEl, 'form');
        var csrfToken = (formEl.elements.csrfToken.value).toString();
        var buttonVal = buttonEl.value.toString();
        // TODO: add otherSubscriptions into form... if buttonVal.beginsWith('unsubscribe-') push to button list?
        var otherSubscriptions = {};
        var htmlPreference = getHTMLPref();
        return encodeFormData(csrfToken, buttonVal, htmlPreference);

    }

    return {
        init: function () {
            addButtonClickEvents();
        }
    };
});
