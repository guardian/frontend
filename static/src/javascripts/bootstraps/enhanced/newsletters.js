define([
    'bean',
    'fastdom',
    'lib/$',
    'lib/fetch',
    'lib/config',
    'common/modules/identity/api'
], function (
    bean,
    fastdom,
    $,
    fetch,
    config,
    Id
) {
    var classes = {
      wrapper: 'js-newsletter-meta',
      signupForm: 'js-email-sub__form',
      textInput: 'js-newsletter-card__text-input',
      signupButton: 'js-newsletter-signup-button',
      styleSignup: 'newsletter-card__lozenge--submit',
      signupConfirm: 'js-signup-confirmation',
      previewButton: 'js-newsletter-preview'
    };

    function hideInputAndShowPreview(el) {
      fastdom.write(function () {
          $('.' + classes.textInput, el).addClass('is-hidden');
          $('.' + classes.signupButton, el).removeClass(classes.styleSignup);
          $('.' + classes.previewButton, el).removeClass('is-hidden');
      });
    }

    function showSignupForm(buttonEl) {
      var form = buttonEl.form;
      var meta = $.ancestor(buttonEl, 'js-newsletter-meta');
      fastdom.write(function () {
          $('.' + classes.textInput, form).removeClass('is-hidden').focus();
          $('.' + classes.signupButton, form).addClass(classes.styleSignup);
          $('.' + classes.previewButton, meta).addClass('is-hidden');
          subscribeToEmail(buttonEl);
      });
    }

    function updatePageForLoggedIn(emailAddress, el) {
        fastdom.write(function () {
            hideInputAndShowPreview(el);
            $('.' + classes.textInput, el).val(emailAddress);
        });
    }

    function validate(form) {
        // simplistic email address validation
        var emailAddress = $('.' + classes.textInput, form).val();
        return typeof emailAddress === 'string' &&
          emailAddress.indexOf('@') > -1;
    }

    function addSubscriptionMessage(buttonEl) {
      var meta = $.ancestor(buttonEl, classes.wrapper);
      fastdom.write(function () {
        $(buttonEl.form).addClass('is-hidden');
        $('.' + classes.previewButton, meta).addClass('is-hidden');
        $('.' + classes.signupConfirm, meta).removeClass('is-hidden');
      });
    }

    function submitForm(form, buttonEl) {
        var formQueryString =
            'email=' + form.email.value + '&' +
            'listId=' + form.listId.value;
        return fetch(
            config.page.ajaxUrl + '/email',
            {
                method: 'post',
                body: formQueryString,
                headers: {
                'Accept': 'application/json'
            }
        })
        .then(function (response) {
            if (response.ok) {
                addSubscriptionMessage(buttonEl);
            }
        });
    }

    function subscribeToEmail(buttonEl) {
      bean.on(buttonEl, 'click', function () {
          var form = buttonEl.form;
          if (validate(form)) {
              submitForm(form, buttonEl);
          }
      });
    }

    function showSecondStageSignup(buttonEl) {
      fastdom.write(function () {
          buttonEl.setAttribute('type', 'button');
          bean.on(buttonEl, 'click', function () {
              showSignupForm(buttonEl);
          });
      });
    }

    function enhanceNewsletters() {
      if (Id.getUserFromCookie() !== null) {
        // email address is not stored in the cookie, gotta go to the Api
        Id.getUserFromApi(function (userFromId) {
          if (userFromId && userFromId.primaryEmailAddress) {
            updatePageForLoggedIn(userFromId.primaryEmailAddress);
            $.forEachElement('.' + classes.signupButton, subscribeToEmail);
          }
        });
      } else {
        hideInputAndShowPreview();
        $.forEachElement('.' + classes.signupButton, showSecondStageSignup);
      }

    }

    return {
        init: function () {
            enhanceNewsletters();
        }
    };
});
