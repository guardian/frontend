// This is a workaround for the email preferences page https://profile.thegulocal.com/email-prefs
// We want to submit subscribe/unsubscribe requests without a full page refresh
// Hopefully this will be short-lived; if it is still alive in 2017, git blame and cry

define(['bean', 'reqwest', 'fastdom', 'lib/$'], function(
    bean,
    reqwest,
    fastdom,
    $
) {
    function reqwestEmailSubscriptionUpdate(buttonEl) {
        bean.on(buttonEl, 'click', function() {
            addUpdatingState(buttonEl);
            var formQueryString = generateFormQueryString([buttonEl]);
            reqwest({
                url: '/email-prefs',
                method: 'POST',
                data: formQueryString,
                error: function() {
                    renderErrorMessage(buttonEl);
                },
                success: function() {
                    updateButton(buttonEl);
                },
            });
        });
    }

    function reqwestUnsubscribeFromAll(buttonEl, subscribedButtons) {
        var formQueryString = generateFormQueryString(subscribedButtons);
        reqwest({
            url: '/email-prefs',
            method: 'POST',
            data: formQueryString,
            error: function() {
                renderErrorMessage(buttonEl);
            },
            success: function() {
                for (var i = 0; i < subscribedButtons.length; i++) {
                    updateSubscriptionButton(subscribedButtons[i]);
                }
                updateButton(buttonEl);
            },
        });
    }

    function unsubscribeFromAll(buttonEl) {
        bean.on(buttonEl, 'click', function() {
            if ($(buttonEl).hasClass('js-confirm-unsubscribe')) {
                addUpdatingState(buttonEl);
                resetUnsubscribeFromAll(buttonEl);
                reqwestUnsubscribeFromAll(
                    buttonEl,
                    $('[value^="unsubscribe"]')
                );
            } else {
                confirmUnsubscriptionFromAll(buttonEl);
            }
        });
    }

    function confirmUnsubscriptionFromAll(buttonEl) {
        fastdom.write(function() {
            $(buttonEl).addClass(
                'email-unsubscribe--confirm js-confirm-unsubscribe'
            );
            $('.email-unsubscribe-all__label').toggleClass('hide');
        });
    }

    function resetUnsubscribeFromAll(buttonEl) {
        fastdom.write(function() {
            $(buttonEl).removeClass(
                'email-unsubscribe--confirm js-confirm-unsubscribe'
            );
            $('.js-unsubscribe--confirm').addClass('hide');
            $('.js-unsubscribe--basic').removeClass('hide');
        });
    }

    function renderErrorMessage(buttonEl) {
        return fastdom.write(function() {
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
            $.forEachElement('.form__error', function(errorEl) {
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

    function updateSubscriptionButton(buttonEl) {
        var buttonVal = buttonEl.value;
        var isSubscribing = !/unsubscribe/.test(buttonVal);

        if (isSubscribing) {
            fastdom.write(function() {
                $(buttonEl).removeClass(
                    'is-updating is-updating-subscriptions'
                );
                buttonEl.value = 'unsubscribe-' + buttonVal;
                buttonEl.innerHTML = 'Unsubscribe';
                $($.ancestor(buttonEl, 'email-subscription')).addClass(
                    'email-subscription--subscribed'
                );
                buttonEl.disabled = false;
            });
        } else {
            fastdom.write(function() {
                $(buttonEl).removeClass(
                    'is-updating is-updating-subscriptions'
                );
                buttonEl.value = buttonVal.replace('unsubscribe-', '');
                buttonEl.innerHTML = 'Subscribe';
                $($.ancestor(buttonEl, 'email-subscription')).removeClass(
                    'email-subscription--subscribed'
                );
                buttonEl.disabled = false;
            });
        }
    }

    function updateButton(buttonEl) {
        if ($(buttonEl).hasClass('js-subscription-button')) {
            updateSubscriptionButton(buttonEl);
        } else {
            fastdom.write(function() {
                setTimeout(function() {
                    $(buttonEl).removeClass(
                        'is-updating is-updating-subscriptions'
                    );
                    buttonEl.disabled = false;
                }, 1000);
            });
        }
    }

    function generateFormQueryString(buttons) {
        var csrfToken = $('.form')[0].elements.csrfToken.value.toString();
        var htmlPreference = $('[name="htmlPreference"]:checked').val();
        var buttonString = '';
        for (var i = 0; i < buttons.length; i++) {
            var value = buttons[i].value;
            var unsubscribeMatches = value.match(/unsubscribe-(.*)/);
            if (unsubscribeMatches) {
                var listIds = unsubscribeMatches[1].split(',');
                for (var j = 0; j < listIds.length; j++) {
                    buttonString +=
                        'removeEmailSubscriptions[]=' +
                        encodeURIComponent(listIds[j]) +
                        '&';
                }
            } else {
                buttonString +=
                    'addEmailSubscriptions[]=' +
                    encodeURIComponent(value) +
                    '&';
            }
        }
        return (
            'csrfToken=' +
            encodeURIComponent(csrfToken) +
            '&' +
            buttonString +
            'htmlPreference=' +
            encodeURIComponent(htmlPreference)
        );
    }

    function enhanceEmailPreferences() {
        $.forEachElement(
            '.js-subscription-button',
            reqwestEmailSubscriptionUpdate
        );
        $.forEachElement('.js-save-button', reqwestEmailSubscriptionUpdate);
        $.forEachElement('.js-unsubscribe', unsubscribeFromAll);
    }

    return {
        init: function() {
            enhanceEmailPreferences();
        },
    };
});
