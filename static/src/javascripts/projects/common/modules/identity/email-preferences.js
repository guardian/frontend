// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

define([
    'bean',
    'reqwest',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    reqwest,
    fastdom,
    $
) {
    function reqwestEmailSubscriptionUpdate(buttonEl) {
        bean.on(buttonEl, 'click', function () {
            addUpdatingState(buttonEl);
            var formQueryString = generateFormQueryString([buttonEl]);
            reqwest({
                url: '/email-prefs',
                method: 'POST',
                data: formQueryString,
                error: function () {
                    renderErrorMessage(buttonEl);
                },
                success: function (response) {
                    var isSubscribed = false;
                    if (response && response.subscriptions && response.subscriptions.length) {
                        isSubscribed = true;
                    }
                    updateButton(buttonEl, isSubscribed);
                }
            });
        });
    }

    function unsubscribeFromAll(buttonEl) {
        bean.on(buttonEl, 'click', function () {
            var subscribedButtons = getAllSubscribedButtons();
            for (var i = 0; i < subscribedButtons.length; i++) {
                subscribedButtons[i].click();
            }
            updateButton(buttonEl);
        });
    }

    function getAllSubscribedButtons() {
        var buttons = [];
        $.forEachElement('.js-subscription-button', function (buttonEl) {
            if (buttonEl.value.indexOf('unsubscribe') !== -1) {
                buttons.push(buttonEl);
            }
        });
        return buttons;
    }

    function enhanceEmailPreferences() {
        $.forEachElement('.js-subscription-button', reqwestEmailSubscriptionUpdate);
        $.forEachElement('.save__button', reqwestEmailSubscriptionUpdate);
        $.forEachElement('.js-unsubscribe', unsubscribeFromAll);
    }

    function encodeFormData(csrfToken, buttonVal, htmlPreference) {
        return 'csrfToken=' + encodeURIComponent(csrfToken) + '&' +
        'addEmailSubscription=' + encodeURIComponent(buttonVal) + '&' +
        'htmlPreference=' + encodeURIComponent(htmlPreference);
    }

    function renderErrorMessage(buttonEl) {
        return fastdom.write(function () {
            clearErrorMessages();
            var errorMessage = $.create(
                '<div class="form__error">' +
                    'Sorry, an error has occurred, please refresh the page and try again' +
                '</div>'
            );
            $(errorMessage).insertAfter(buttonEl.parentNode);
        });
    }

    function clearErrorMessages() {
        if ($('.form__error')) {
            $.forEachElement('.form__error', function (errorEl) {
                errorEl.parentNode.removeChild(errorEl);
            });
        }
    }

    function addUpdatingState(buttonEl) {
        fastdom.write(function() {
            buttonEl.disabled = true;
            $(buttonEl).addClass('is-updating is-updating-subscriptions');
        });
    }

    function updateSubscriptionButton(buttonEl, isSubscribed) {
        var buttonVal = buttonEl.value;
        if (isSubscribed) {
            fastdom.write(function () {
                $(buttonEl).removeClass('is-updating is-updating-subscriptions');
                buttonEl.value = 'unsubscribe-' + buttonVal;
                buttonEl.innerHTML = 'Unsubscribe';
                $($.ancestor(buttonEl, 'email-subscription')).addClass('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        } else {
            fastdom.write(function () {
                $(buttonEl).removeClass('is-updating is-updating-subscriptions');
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                $($.ancestor(buttonEl, 'email-subscription')).removeClass('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        }
    }

    function updateButton(buttonEl, isSubscribed) {
        if ($(buttonEl).hasClass('js-subscription-button')) {
            updateSubscriptionButton(buttonEl, isSubscribed);
        } else {
            fastdom.write(function () {
                $(buttonEl).removeClass('is-updating is-updating-subscriptions');
                buttonEl.disabled = false;
            });
        }
    }

    function generateFormQueryString(buttons) {
        // takes an array of button values and adds each button to the form
        var formEl = $('.form')[0];
        var csrfToken = ($('.form')[0].elements.csrfToken.value).toString();
        var htmlPreference = $('[name="htmlPreference"]:checked').val();
        var buttonString = '';
        for (var i = 0; i < buttons.length; i++) {
            buttonString += 'addEmailSubscription=' + encodeURIComponent(buttons[i].value) + '&';
        }
        return 'csrfToken=' + encodeURIComponent(csrfToken) + '&' +
        buttonString + 'htmlPreference=' + encodeURIComponent(htmlPreference);
    }

    return {
        init: function () {
            enhanceEmailPreferences();
        }
    };
});
