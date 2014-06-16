/**
 * Created by cfinch on 16/06/2014.
 */
define([
    'common/$',
    'bean',
    'common/modules/identity/api',
    'common/modules/identity/membership/masker',
    'stripe',
    'common/utils/ajax',
], function ($, bean, userUtil, masker, stripe, ajax) {
    'use strict';

    var PUBLIC_STRIPE_KEY = 'pk_test_Qm3CGRdrV4WfGYCpm0sftR0f';

    function StripePaymentForm () {
        return this;
    }

    StripePaymentForm.prototype.config = {
        classes: {
            STRIPE_FORM: 'js-stripe-form',
            FORM_FIELD_ERROR: 'form-field--error',
            ERROR_CARD_NUMBER: 'js-error--card-number',
            ERROR_CARD_CVC: 'js-error--card-cvc',
            ERROR_CARD_EXPIRY: 'js-error--card-expiry',
            HIDE: 'is-hidden',
            PAYMENT_ERRORS: 'js-payment-errors',
            FORM_SUBMIT: 'js-submit-input',
            CREDIT_CARD_NUMBER: 'js-credit-card-number',
            CREDIT_CARD_CVC: 'js-credit-card-cvc',
            CREDIT_CARD_EXPIRY_MONTH: 'js-credit-card-exp-month',
            CREDIT_CARD_EXPIRY_YEAR: 'js-credit-card-exp-year',
            CREDIT_CARD_IMAGE: 'js-credit-card-image',
            CREDIT_CARD: 'credit-card--active',
            TIER_FIELD: 'js-tier-field',
            UPDATING: 'js-updating'
        },
        DOM: {},
        data: {
            CARD_TYPE: 'data-card-type'
        }
    };

    StripePaymentForm.prototype.domElementSetup = function () {
        for (var className in this.config.classes) {
            this.config.DOM[className] = this.context.querySelector('.' + this.config.classes[className]);
        }
    };

    StripePaymentForm.prototype.getElement = function (element) {
        return $(this.config.DOM[element]);
    };

    StripePaymentForm.prototype.stripeResponseHandler = function (status, response) {

        var self = this;

        if (response.error) {
            self.handleError(response.error.message);
        } else {

            // token contains id, last4, and card type
            var token = response.id;

            ajax({
                url: 'https://mem.thegulocal.com/subscription/update',
                crossOrigin: true,
                withCredentials: true,
                method: 'post',
                data: {
                    stripeToken: token
                }
            }).then(self.successCallback, function fail () {
                self.handleError('There has been an error, please try again.');
            });
        }
    };

    StripePaymentForm.prototype.handleError = function (errorMessage) {
        var $responseErrorElement = this.getElement('PAYMENT_ERRORS'),
            $submitButton = this.getElement('FORM_SUBMIT'),
            eMessage = errorMessage || '';

        if (eMessage && (/[a-zA-Z]/).test(eMessage)) { // msg exists and has content
            $responseErrorElement.text(eMessage).removeClass(this.config.classes.HIDE);
            $submitButton.attr('disabled', false);
        } else {
            $responseErrorElement.text(eMessage).addClass(this.config.classes.HIDE);
            $submitButton.attr('disabled', false);
        }
    };

    StripePaymentForm.prototype.getCardType = function (cardNumber) {
        return stripe.cardType(cardNumber).toLowerCase().replace(' ', '-');
    };

    StripePaymentForm.prototype.displayCardTypeImage = function ($creditCardNumberElement) {
        var cardType = this.getCardType($creditCardNumberElement.val()),
            $creditCardImageElement = this.getElement('CREDIT_CARD_IMAGE');

        $creditCardImageElement[0].className = $creditCardImageElement[0].className.replace(/\bi-\S*/gi, '');
        $creditCardImageElement.addClass('i-' + cardType);
    };

    StripePaymentForm.prototype.addListeners = function () {

        var stripePaymentFormClass = this,
            $creditCardNumberElement = this.getElement('CREDIT_CARD_NUMBER'),
            $creditCardCVCElement = this.getElement('CREDIT_CARD_CVC'),
            $creditCardExpiryMonthElement = this.getElement('CREDIT_CARD_EXPIRY_MONTH'),
            $creditCardExpiryYearElement = this.getElement('CREDIT_CARD_EXPIRY_YEAR'),
            $formElement = $(this.context);

        bean.on($creditCardNumberElement[0], 'keyup blur', function () {
            masker(' ', 4).bind(this)();
            stripePaymentFormClass.displayCardTypeImage($creditCardNumberElement);
        });

        bean.on($creditCardNumberElement[0], 'blur', function () {
            this.manageFieldValidationResult(this.validateCardNumber());
        }.bind(this));

        bean.on($creditCardCVCElement[0], 'blur', function () {
            this.manageFieldValidationResult(this.validateCVC());
        }.bind(this));

        bean.on($creditCardExpiryMonthElement[0], 'blur', function () {
            this.manageFieldValidationResult(this.validateExpiry(true));
        }.bind(this));

        bean.on($creditCardExpiryYearElement[0], 'blur', function () {
            this.manageFieldValidationResult(this.validateExpiry(true));
        }.bind(this));

        bean.on($formElement[0], 'submit', function (e) {
            e.preventDefault();

            var formValidationResult = this.isFormValid();

            if (formValidationResult.isValid) {

                this.startLoader();

                stripe.card.createToken({
                    number: $creditCardNumberElement.val(),
                    cvc: $creditCardCVCElement.val(),
                    exp_month: $creditCardExpiryMonthElement.val(),
                    exp_year: $creditCardExpiryYearElement.val()
                }, this.stripeResponseHandler.bind(this));

            } else {
                this.manageFormValidationResult(formValidationResult);
            }
        }.bind(this));
    };

    StripePaymentForm.prototype.validateCardNumber = function () {

        var $creditCardNumberElement = this.getElement('CREDIT_CARD_NUMBER'),
            value = $creditCardNumberElement.val(),
            isValid = stripe.card.validateCardNumber(value);

        return {
            isValid: isValid,
            element: $creditCardNumberElement
        };
    };

    StripePaymentForm.prototype.validateCVC = function () {

        var $creditCardCVCElement = this.getElement('CREDIT_CARD_CVC');
        var isValid = stripe.card.validateCVC($creditCardCVCElement.val());

        return {
            isValid: isValid,
            element: $creditCardCVCElement
        };
    };

    StripePaymentForm.prototype.validateExpiry = function (allowEmpty) {

        var $creditCardExpiryMonthElement = this.getElement('CREDIT_CARD_EXPIRY_MONTH'),
            $creditCardExpiryYearElement = this.getElement('CREDIT_CARD_EXPIRY_YEAR');

        var isValid = true;
        if (!allowEmpty || $creditCardExpiryMonthElement[0].selectedIndex > 0 &&
            $creditCardExpiryYearElement[0].selectedIndex > 0) {

            isValid = stripe.card.validateExpiry($creditCardExpiryMonthElement.val(), $creditCardExpiryYearElement.val());
        }

        return {
            isValid: isValid,
            element: $creditCardExpiryMonthElement
        };
    };

    StripePaymentForm.prototype.isFormValid = function () {

        var errors = [],
            validationProfiles = [
                this.validateCardNumber,
                this.validateCVC,
                this.validateExpiry
            ];

        for (var profile in validationProfiles) {

            var validationProfile = validationProfiles[profile];

            if (validationProfiles.hasOwnProperty(profile) && 'function' === typeof validationProfile) {

                var result = validationProfile.call(this);

                if (!result.isValid) {
                    errors.push(result);
                }
            }
        }

        return {
            isValid: !errors.length,
            errors: errors
        };
    };

    StripePaymentForm.prototype.manageFieldValidationResult = function (validationResult) {
        var self = this,
            $el = validationResult.element,
            $par = $el.parent();

        // generate complete error message with current invalid field, maintain correct punctuation and prevent repetition
        function genErrorMessage (remove) {
            var errorEl = self.getElement('PAYMENT_ERRORS')[0],
                eMsg = $el.data('error-message'),
                currentError = errorEl.innerHTML.replace(eMsg, '').replace(/, $/, '').replace(/^, /, '');
            if (remove) {
                return currentError.replace(', ,', ', ');
            } else {
                return (currentError.length > 0 ? currentError.replace(eMsg, '') + ', ' + eMsg : eMsg).replace(', ,', ', ');
            }
        }

        // if invalid add error class and post error message else remove class and remove element error message from current error message
        if (!validationResult.isValid) {
            $par.addClass(this.config.classes.FORM_FIELD_ERROR);
            this.handleError(genErrorMessage());
        } else {
            $par.removeClass(this.config.classes.FORM_FIELD_ERROR);
            this.handleError(genErrorMessage(true));
        }
    };

    StripePaymentForm.prototype.manageFormValidationResult = function (validationResult) {
        var self = this;

        function genErrorMessage () { // Generate error message for form
            var msg = [];
            validationResult.errors.forEach(function (error) {
                msg.push(error.element.data('error-message'));
            }, self);
            return msg.join(', ');
        }

        // remove error class from all fields
        $('.' + this.config.classes.FORM_FIELD_ERROR, this.context).removeClass(this.config.classes.FORM_FIELD_ERROR);

        // add error class to invalid fields
        validationResult.errors.forEach(function (error) {
            error.element.parent().addClass(this.config.classes.FORM_FIELD_ERROR);
        }, this);

        // display error message if invalid else remove error classes and remove message
        if (!validationResult.isValid) {
            this.handleError(genErrorMessage());
        } else {
            $('.' + this.config.classes.FORM_FIELD_ERROR, this.context).removeClass(this.config.classes.FORM_FIELD_ERROR);
            this.handleError(); // empty param = remove error
        }
    };

    StripePaymentForm.prototype.startLoader = function () {
        this.getElement('UPDATING').css('display', 'inline-block');
    };

    StripePaymentForm.prototype.stopLoader = function () {
        this.getElement('UPDATING').css('display', 'none');
    };

    StripePaymentForm.prototype.init = function (context, successCallback) {

        this.successCallback = successCallback;

        this.context = context || document.querySelector('.' + this.config.classes.STRIPE_FORM);

        if (!this.context.className.match(this.config.classes.STRIPE_FORM)) {
            this.context = this.context.querySelector('.' + this.config.classes.STRIPE_FORM);
        }

        if (this.context) {
            this.domElementSetup();

            this.addListeners();

            stripe.setPublishableKey(PUBLIC_STRIPE_KEY);
        }
    };

    return StripePaymentForm;
});