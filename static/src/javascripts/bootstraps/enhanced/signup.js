define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/modules/identity/api'
], function (
    bean,
    fastdom,
    $,
    config,
    Id
) {
    function shoutOut(buttonEl, emailAddress) {
        console.log('emailAddress = ' + emailAddress);
        Id.getUserFromApi(function (userFromId) {
            console.log(buttonEl.value);
            console.log(userFromId);
        });
    }

    function updateFormForLoggedIn(userFromId, el) {
      if (userFromId && userFromId.primaryEmailAddress) {
        fastdom.write(function () {
            $('.js-newsletter-card__text-input', el).addClass('is-hidden');
            $('.js-newsletter-signup-button', el).removeClass('newsletter-card__lozenge--submit');
            $('.js-newsletter-preview-button', el).removeClass('is-hidden');
            $('.js-newsletter-card__text-input', el).val(userFromId.primaryEmailAddress);
        });
      }
    }

    function validate(emailInput, emailAddress) {
        // simplistic email address validation
        return typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;
    }

    function addUpdatingState(buttonEl) {
        fastdom.write(function() {
            buttonEl.disabled = true;
            $(buttonEl).addClass('is-updating lozenge--is-updating');
        });
    }

    function subscribeToEmail(buttonEl) {
        bean.on(buttonEl, 'click', function () {
          var $form = buttonEl.form;
          var emailInput = $('.js-newsletter-card__text-input', $form);
          var emailAddress = emailInput.val();

          if (validate(emailInput, emailAddress)) {
            addUpdatingState(buttonEl);
            //submitEmailSignup();
          }
          shoutOut(buttonEl, emailAddress, listId);
            return fetch(config.page.ajaxUrl + '/email', {
                method: 'POST',
                body: 'email=' + encodeURIComponent(emailAddress) +
                        '&listId=' + listId,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Fetch error: ' + response.status + ' ' + response.statusText);
                }
            });
            addUpdatingState(buttonEl);
        });
    }

    function enhanceNewsletters(userFromId, el) {
      Id.getUserFromApi(function (userFromId) {
          updateFormForLoggedIn(userFromId);
      });
      $.forEachElement('.js-newsletter-signup-button', subscribeToEmail);

    }

    return {
        init: function () {
            enhanceNewsletters();
        }
    };
});
