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
            var formQueryString = generateFormQueryString(buttonEl);
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
                    $(buttonEl).removeClass('is-updating is-updating-subscriptions');
                    updateButton(buttonEl, isSubscribed);
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
            buttonEl.innerHTML = '';
            $(buttonEl).addClass('is-updating is-updating-subscriptions');
        });
    }

    function updateSubscriptionButton(buttonEl, isSubscribed) {
        var buttonVal = buttonEl.value;
        if (isSubscribed) {
            fastdom.write(function () {
                buttonEl.value = 'unsubscribe-' + buttonVal;
                buttonEl.innerHTML = 'Unsubscribe';
                $($.ancestor(buttonEl, 'email-subscription')).addClass('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        } else {
            fastdom.write(function () {
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                $($.ancestor(buttonEl, 'email-subscription')).removeClass('email-subscription--subscribed');
                buttonEl.disabled = false;
            });
        }
    }

    function updateSaveButton(buttonEl) {
        fastdom.write(function () {
            buttonEl.innerHTML = 'Save';
            buttonEl.disabled = false;
        });
    }

    function updateButton(buttonEl, isSubscribed) {
        if ($(buttonEl).hasClass('save__button')) {
            updateSaveButton(buttonEl);
        } else {
            updateSubscriptionButton(buttonEl, isSubscribed);
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
