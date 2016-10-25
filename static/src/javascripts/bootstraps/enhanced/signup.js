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

    function updateFormForLoggedIn(emailAddress, el) {
        fastdom.write(function () {
            $('.js-newsletter-card__text-input', el).addClass('is-hidden');
            $('.js-newsletter-signup-button', el).removeClass('newsletter-card__lozenge--submit');
            $('.js-newsletter-preview-button', el).removeClass('is-hidden');
            $('.js-newsletter-card__text-input', el).val(emailAddress);
        });
    }

    // show subscribed state for signed in users
    function updateEmailSubscriptions() {
      var emailSubscriptions = function () {
        return Id.getUserEmailSignUps()
                  .then();
      }();
    }

    function validate(emailAddress) {
        // simplistic email address validation
        return typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;
    }

    function addUpdatingState(buttonEl) {
        fastdom.write(function() {
            buttonEl.disabled = true;
            $(buttonEl).addClass('is-updating lozenge--is-updating');
        });
        updateButton(buttonEl);
    }

    function updateButton(buttonEl) {
      fastdom.write(function () {
          setTimeout(function () {
              $(buttonEl).removeClass('is-updating lozenge--is-updating');
              buttonEl.disabled = false;
          }, 2000);
          addSubscriptionMessage(buttonEl);
      });
    }

    function addSubscriptionMessage(buttonEl) {
      var $meta = $.ancestor(buttonEl, 'js-newsletter-meta');
      $(buttonEl.form).addClass('is-hidden');
      $('.signup-confirmation', $meta).removeClass('is-hidden');
    }

    function subscribeToEmail(buttonEl) {
        bean.on(buttonEl, 'click', function () {
          addUpdatingState(buttonEl);
          if (validate()) {
            addUpdatingState(buttonEl);
          }
        });
    }


          // var $form = buttonEl.form;
          // var emailAddress = $(
          //   '.js-newsletter-card__text-input', $form).val();
          // var listId = $(
          //   '.js-email-sub__listid-input', $form).val();
          // if (Id.isUserLoggedIn()) {
          //   Id.emailSignup(listId);
          // }
          //
          // if (validate(emailAddress)) {
          //   submitEmailSignup(emailAddress, listId);
          //   addUpdatingState(buttonEl);
          // }
        // });

    function submitEmailSignup(emailAddress, listId) {
      return fetch(config.page.ajaxUrl + '/email', {
          method: 'POST',
          body: 'email=' + encodeURIComponent(emailAddress) +
          '&listId=' + encodeURIComponent(listId)
      })
      .then(function (response) {
          if (!response.ok) {
              throw new Error('Fetch error: ' + response.status + ' ' + response.statusText);
          }
      });
    }

    function enhanceNewsletters(userFromId) {
      if (userFromId && userFromId.primaryEmailAddress) {
        Id.getUserFromApi(function (userFromId) {
            updateFormForLoggedIn(userFromId.primaryEmailAddress);

        });
      }
      $.forEachElement('.js-newsletter-signup-button', subscribeToEmail);
    }

    return {
        init: function () {
            enhanceNewsletters();
            updateEmailSubscriptions();
        }
    };
});
