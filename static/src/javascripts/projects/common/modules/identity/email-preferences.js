// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh


define([
    'bean',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    fastdom,
    $
) {
    function submitEmailForm(buttonEl) {
        bean.on(buttonEl, 'click', function () {
            // TODO: replace xhr with fetch or reqwest
            var xhr = new XMLHttpRequest();
            var url = '/email-prefs';
            var params = submitFormData(buttonEl);

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    alert(xhr.responseText);
                }
            };
            xhr.send(params);

            alterButton(buttonEl);
            });
    }

    function addButtonClickEvents() {
        $.forEachElement('.email-subscription__button', submitEmailForm);
    }

    function encodeFormData(csrfToken, buttonVal, htmlPreference) {
        return 'csrfToken=' + csrfToken + '&' +
        'addEmailSubscription=' + buttonVal + '&' +
        'htmlPreference=' + htmlPreference;
    }

    function alterButton(buttonEl) {
        // do this after successful POST request to update the appearance and value of the button
        var buttonVal = buttonEl.value;
        if (buttonVal.startsWith('unsubscribe-')) {
            fastdom.write(function () {
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                $.ancestor(buttonEl, 'email-subscription').classList.remove('email-subscription--subscribed');
            });
        } else {
            fastdom.write(function () {
                buttonEl.value = 'unsubscribe-' + buttonVal;
                buttonEl.innerHTML = 'Unsubscribe';
                $.ancestor(buttonEl, 'email-subscription').classList.add('email-subscription--subscribed');
            });
        }
    }

    function submitFormData(buttonEl) {
        var formEl = $.ancestor(buttonEl, 'form');
        var csrfToken = (formEl.elements.csrfToken.value).toString();
        var buttonVal = buttonEl.value.toString();
        // TODO: Grab the HTML pref from the DOM
        var htmlPreference = 'HTML'.toString();
        return encodeFormData(csrfToken, buttonVal, htmlPreference);

    }

    return {
        init: function () {
            addButtonClickEvents();
        }
    };
});
