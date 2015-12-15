define([
    'bean',
    'stripe',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'membership/masker',
    'membership/stripe-error-messages'
], function (
    bean,
    stripe,
    $,
    ajax,
    config,
    masker,
    stripeErrorMessages
) {
    //TODO-benc this work needs to be swapped out for the form.js work found on membership coming up in a separate PR
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    'use strict';

    var sharedConfig = {
        classes: {
            CARD_TYPE: 'js-manage-account-card-type',
            CARD_LAST4: 'js-manage-account-card-last4',
            CHANGE_CARD: 'js-manage-account-change-card',
            IS_CLOSED: 'is-closed',
            CARD_DETAILS_FORM_CONTAINER: 'js-manage-account-card-details-form-container',
            CTA_DISABLED_CLASSNAME: 'membership-cta--disabled',
            STRIPE_FORM: 'js-stripe-form',
            FORM_FIELD_ERROR: 'form-field--error',
            ERROR_CARD_NUMBER: 'js-error--card-number',
            ERROR_CARD_CVC: 'js-error--card-cvc',
            ERROR_CARD_EXPIRY: 'js-error--card-expiry',
            HIDE: 'is-hidden',
            PAYMENT_ERRORS: 'js-payment-errors',
            FORM_SUBMIT: 'js-manage-account-change-cc-submit',
            CREDIT_CARD_NUMBER: 'js-credit-card-number',
            CREDIT_CARD_CVC: 'js-credit-card-cvc',
            CREDIT_CARD_EXPIRY_MONTH: 'js-credit-card-exp-month',
            CREDIT_CARD_EXPIRY_YEAR: 'js-credit-card-exp-year',
            CREDIT_CARD_IMAGE: 'js-credit-card-image',
            CREDIT_CARD: 'credit-card--active',
            TIER_FIELD: 'js-tier-field',
            UPDATING: 'js-updating'
        },
        data: {
            CARD_TYPE: 'data-card-type'
        }
    };

    /**
     * @param {String|Element} form element or selector which is the form this is for
     * @param {String|Element} successElement element or selector for the success element to show/hide
     * @param {String} url The API url to hit with a new card token
     * @returns {StripePaymentForm}
     * @constructor
     */
    function StripePaymentForm(form, successElement, url) {
        this.PUBLIC_STRIPE_KEY = config.page.stripePublicToken;
        this.$successElement = $(successElement);
        this.context = $(form)[0];
        this.apiUrl = url;
        this.DOM = {};
        this.init();
        return this;
    }

    /**
     * @param {{last4: string, type: string}} card info
     */
    StripePaymentForm.prototype.updateCard = function (card) {
        var cardTypeClassName = card.type.toLowerCase().replace(' ', '-');
        var cardTypeElem = this.DOM.CARD_TYPE;
        $(this.DOM.CARD_LAST4).text(card.last4);
        cardTypeElem.className = cardTypeElem.className.replace(/\bi-\S+/g, '');
        $(cardTypeElem).addClass('i-' + cardTypeClassName);
    };

    StripePaymentForm.prototype.showCardDetailsElementWithChangeCardOption = function () {
        $(this.DOM.CHANGE_CARD).removeClass(sharedConfig.classes.HIDE);
        this.showCardDetailsElement();
    };

    StripePaymentForm.prototype.showCardDetailsElement = function () {
        $(this.context).removeClass(sharedConfig.classes.HIDE);
    };

    StripePaymentForm.prototype.toggle = function (show) {
        var $cont = $(this.DOM.CARD_DETAILS_FORM_CONTAINER),
            $button = $(this.DOM.CHANGE_CARD);

        show = show !== undefined ? show : $cont.hasClass(sharedConfig.classes.IS_CLOSED);

        if (show) {
            $cont.removeClass(sharedConfig.classes.IS_CLOSED);
            $button.addClass(sharedConfig.classes.CTA_DISABLED_CLASSNAME).text('Cancel');
        } else {
            $cont.addClass(sharedConfig.classes.IS_CLOSED);
            $button.removeClass(sharedConfig.classes.CTA_DISABLED_CLASSNAME).text('Change card');
        }
    };

    StripePaymentForm.prototype.displayMonthError = false;

    /**
     * get parent by className
     * @param $element
     * @param parentClass
     * @returns {*}
     */
    StripePaymentForm.prototype.getSpecifiedParent = function ($element, parentClass) {

        do {
            $element = $element.parent();

        } while ($element && !$element.hasClass(parentClass));

        return $element;
    };

    StripePaymentForm.prototype.domElementSetup = function () {
        this.DOM = {};
        for (var className in sharedConfig.classes) {
            this.DOM[className] = this.context.querySelector('.' + sharedConfig.classes[className]);
        }
    };

    StripePaymentForm.prototype.stripeResponseHandler = function (status, response) {

        var errorMessage, token,
            self = this;

        if (response.error) {
            errorMessage = self.getErrorMessage(response.error);
            if (errorMessage) {
                self.handleErrors([errorMessage]);
            }
        } else {

            // token contains id, last4, and card type
            token = response.id;

            ajax({
                url: config.page.userAttributesApiUrl + self.apiUrl,
                crossOrigin: true,
                withCredentials: true,
                method: 'post',
                headers: {
                    'Csrf-Token': 'nocheck'
                },
                data: {
                    stripeToken: token
                }
            }).then(function success(card) {
                $(self.DOM.FORM_SUBMIT).removeAttr('disabled');
                self.stopLoader();
                self.reset();
                self.updateCard(card);
                self.toggle();
                self.$successElement.removeClass(sharedConfig.classes.HIDE);

            }, function fail(error) {

                var errorObj,
                    errorMessage;

                errorObj = error.response && JSON.parse(error.response);
                errorMessage = self.getErrorMessage(errorObj);
                if (errorMessage) {
                    self.handleErrors([errorMessage]);
                }

                self.stopLoader();
            });
        }
    };

    /**
     * get friendly error messages via codes sent from stripe
     * @param errorObj {type: 'card_error', code: 'incorrect_number', decline_code: 'do_not_honour'}
     * @returns {*}
     */
    StripePaymentForm.prototype.getErrorMessage = function (errorObj) {

        var errorCode = errorObj && errorObj.code,
            errorType = errorObj && errorObj.type,
            errorSection = stripeErrorMessages[errorType],
            errorMessage;

        if (errorSection) {
            errorMessage = errorSection[errorCode];

            if (errorCode === 'card_declined') {
                errorMessage = errorSection.card_declined[errorObj.decline_code];
                if (!errorMessage) {
                    errorMessage = errorSection.card_declined.generic_decline;
                }
            }
        }

        if (!errorMessage) {
            errorMessage = stripeErrorMessages.generic_error;
        }

        return errorMessage;
    };

    /**
     *
     * @param errorMessages
     */
    StripePaymentForm.prototype.handleErrors = function (errorMessages) {
        var $paymentErrorsElement = $(this.DOM.PAYMENT_ERRORS),
            $formSubmitButton = $(this.DOM.FORM_SUBMIT),
            errorString = '';

        if (errorMessages.length) {
            //display errors and disable submit
            errorMessages.forEach(function (element) {
                errorString += element + '\n';
            });

            $paymentErrorsElement
                .removeClass(sharedConfig.classes.HIDE)
                .html(errorString);

            $formSubmitButton.attr('disabled', true);
        } else {
            //hide errors and enable submit
            $paymentErrorsElement.html('');
            $paymentErrorsElement.addClass(sharedConfig.classes.HIDE);
            $formSubmitButton.removeAttr('disabled');
        }
    };

    StripePaymentForm.prototype.getCardType = function (cardNumber) {
        return stripe.cardType(cardNumber).toLowerCase().replace(' ', '-');
    };

    StripePaymentForm.prototype.displayCardTypeImage = function (creditCardNumber) {
        var cardType = this.getCardType(creditCardNumber),
            $creditCardImageElement = $(this.DOM.CREDIT_CARD_IMAGE);

        $creditCardImageElement[0].className = $creditCardImageElement[0].className.replace(/\bi-\S*/gi, '');
        $creditCardImageElement.addClass('i-' + cardType);
    };

    StripePaymentForm.prototype.addListeners = function () {
        var self = this,
            $creditCardNumberElement = $(self.DOM.CREDIT_CARD_NUMBER),
            $creditCardCVCElement = $(self.DOM.CREDIT_CARD_CVC),
            $creditCardExpiryMonthElement = $(self.DOM.CREDIT_CARD_EXPIRY_MONTH),
            $creditCardExpiryYearElement = $(self.DOM.CREDIT_CARD_EXPIRY_YEAR);

        bean.on(this.DOM.CHANGE_CARD, 'click', function () {
            self.$successElement.addClass(sharedConfig.classes.HIDE);
            self.toggle();
        });

        bean.on($creditCardNumberElement[0], 'keyup blur', function (e) {
            var validationResult,
                $creditCardNumberElement = $(e.target);

            masker(' ', 4).bind(this)(e);
            self.displayCardTypeImage($creditCardNumberElement.val());

            if (e.type === 'blur') {
                validationResult = self.validateCardNumber($creditCardNumberElement);

                self.manageErrors(validationResult);
            }

        });

        bean.on($creditCardCVCElement[0], 'blur', function (e) {

            var $cvcElement = $(e.target),
                validationResult = self.validateCVC($cvcElement);

            self.manageErrors(validationResult);

        });

        bean.on($creditCardExpiryMonthElement[0], 'change', function (e) {

            self.setDisplayMonthErrorStatus();

            var $expiryMonthElement = $(e.target),
                validationResult = self.validateExpiry($expiryMonthElement);

            self.manageErrors(validationResult);

        });

        bean.on($creditCardExpiryYearElement[0], 'change', function (e) {

            self.displayMonthError = true;

            var $expiryYearElement = $(e.target),
                validationResult = self.validateExpiry($expiryYearElement);

            self.manageErrors(validationResult);

        });

        bean.on(self.context, 'submit', function (e) {
            e.preventDefault();

            // turn month select errors on when submitting
            self.displayMonthError = true;
            $(self.DOM.FORM_SUBMIT).attr('disabled', true);
            var formValidationResult = self.isFormValid();

            if (formValidationResult.isValid) {

                self.startLoader();

                stripe.card.createToken({
                    number: $creditCardNumberElement.val(),
                    cvc: $creditCardCVCElement.val(),
                    exp_month: $creditCardExpiryMonthElement.val(),
                    exp_year: $creditCardExpiryYearElement.val()
                }, self.stripeResponseHandler.bind(self));

            } else {
                formValidationResult.errors.forEach(function (validationProfileResult) {
                    self.manageErrors(validationProfileResult);
                });
            }
        });
    };

    /**
     *
     * @param $creditCardNumberElement
     * @returns Object
     * {{isValid: *, errorMessage: (config/stripeErrorMessages.card_error.incorrect_number|*), $element: *}}
     */
    StripePaymentForm.prototype.validateCardNumber = function ($creditCardNumberElement) {

        var $element = $creditCardNumberElement || $(this.DOM.CREDIT_CARD_NUMBER);

        return {
            isValid: stripe.card.validateCardNumber($element.val()),
            errorMessage: stripeErrorMessages.card_error.incorrect_number,
            $element: $element
        };
    };

    /**
     *
     * @param $cvcElement
     * @returns Object
     * {{isValid: *, errorMessage: (config/stripeErrorMessages.card_error.incorrect_cvc|*), $element: *}}
     */
    StripePaymentForm.prototype.validateCVC = function ($cvcElement) {

        var $element = $cvcElement || $(this.DOM.CREDIT_CARD_CVC);

        return {
            isValid: stripe.card.validateCVC($element.val()),
            errorMessage: stripeErrorMessages.card_error.incorrect_cvc,
            $element: $element
        };
    };

    /**
     * Display the month error only if the year has a value
     * @returns {boolean}
     */
    StripePaymentForm.prototype.setDisplayMonthErrorStatus = function () {
        var $creditCardExpiryYearElement = $(this.DOM.CREDIT_CARD_EXPIRY_YEAR);

        this.displayMonthError = $creditCardExpiryYearElement[0].selectedIndex !== 0;
    };

    /**
     *
     * @returns Object
     * {{isValid: boolean, errorMessage: (config/stripeErrorMessages.card_error.invalid_expiry|*), $element: *}}
     */
    StripePaymentForm.prototype.validateExpiry = function () {

        var $creditCardExpiryMonthElement = $(this.DOM.CREDIT_CARD_EXPIRY_MONTH),
            $creditCardExpiryYearElement = $(this.DOM.CREDIT_CARD_EXPIRY_YEAR),
            today = new Date(),
            isValid = !this.displayMonthError,
            validDateEntry = function () {
                var presentOrFutureMonth = true,
                    monthAndYearHaveValue = $creditCardExpiryMonthElement[0].selectedIndex > 0 &&
                        $creditCardExpiryYearElement[0].selectedIndex > 0;

                // if we are on the current year check the month is the current or a future month
                if ($creditCardExpiryYearElement.val() === today.getFullYear().toString()) {
                    presentOrFutureMonth = $creditCardExpiryMonthElement.val() >= (today.getMonth() + 1);
                }

                return monthAndYearHaveValue && presentOrFutureMonth;
            };

        if (validDateEntry()) {
            isValid = stripe.card.validateExpiry($creditCardExpiryMonthElement.val(), $creditCardExpiryYearElement.val());
        }

        return {
            isValid: isValid,
            errorMessage: stripeErrorMessages.card_error.invalid_expiry,
            $element: $creditCardExpiryMonthElement
        };
    };

    /**
     *
     * @returns Object
     * {{isValid: boolean, errors: Array}}
     */
    StripePaymentForm.prototype.isFormValid = function () {

        var profile, validationProfile, validationProfileResult,
            errors = [],
            validationProfiles = [
                this.validateCardNumber,
                this.validateCVC,
                this.validateExpiry
            ];

        for (profile in validationProfiles) {

            validationProfile = validationProfiles[profile];

            if (validationProfiles.hasOwnProperty(profile) && typeof validationProfile === 'function') {

                validationProfileResult = validationProfile.call(this);

                if (!validationProfileResult.isValid) {
                    errors.push(validationProfileResult);
                }
            }
        }

        return {
            isValid: !errors.length,
            errors: errors
        };
    };

    /**
     *
     * @param validationResult
     */
    StripePaymentForm.prototype.addErrorStyles = function (validationResult) {
        var $elementParentFormField = this.getSpecifiedParent(validationResult.$element, 'form-field');

        if (!validationResult.isValid) {
            $elementParentFormField.addClass('form-field--error');
        } else {
            $elementParentFormField.removeClass('form-field--error');
        }
    };

    /**
     *
     * @param validationResult
     */
    StripePaymentForm.prototype.manageErrors = function (validationResult) {

        var paymentErrorsElement = $(this.DOM.PAYMENT_ERRORS)[0],
            paymentErrorsElementText = paymentErrorsElement.textContent,
            errors = [],
            messageIndex,
            standardFormErrors = [
                stripeErrorMessages.card_error.invalid_expiry,
                stripeErrorMessages.card_error.incorrect_cvc,
                stripeErrorMessages.card_error.incorrect_number
            ];

        this.addErrorStyles(validationResult);

        if (paymentErrorsElementText !== '') {
            //split error element text on '\n' and remove any empty elements from resulting array
            errors = paymentErrorsElementText.split('\n').filter(function (element) { return element.length !== 0; });
        }

        /*
         remove any errors that are not the standard form errors, errors returned from stripe are removed when elements
         are blurred
         */
        if (validationResult.isValid) {
            errors = errors.filter(function (errorMessage) { return standardFormErrors.indexOf(errorMessage) !== -1; });
        }

        messageIndex = errors.indexOf(validationResult.errorMessage);

        if (messageIndex === -1 && !validationResult.isValid) {
            //add error
            errors.push(validationResult.errorMessage);
        } else if (messageIndex >= 0 && validationResult.isValid) {
            //remove error
            errors.splice(messageIndex, 1);
        }

        this.handleErrors(errors);
    };

    StripePaymentForm.prototype.startLoader = function () {
        $(this.DOM.UPDATING).css('display', 'inline-block');
    };

    StripePaymentForm.prototype.stopLoader = function () {
        $(this.DOM.UPDATING).css('display', 'none');
    };

    StripePaymentForm.prototype.reset = function () {
        $(this.DOM.CREDIT_CARD_IMAGE)[0].className = $(this.DOM.CREDIT_CARD_IMAGE)[0].className.replace(/\bi-\S*/gi, '');
        $(this.DOM.CREDIT_CARD_NUMBER).val('');
        $(this.DOM.CREDIT_CARD_CVC).val('');
        $(this.DOM.CREDIT_CARD_EXPIRY_MONTH)[0].selectedIndex = 0;
        $(this.DOM.CREDIT_CARD_EXPIRY_YEAR)[0].selectedIndex = 0;
    };

    /**
     * To display visa logo etc
     */
    StripePaymentForm.prototype.addIconCss = function () {
        var spriteSheetUrl = $(this.context).data('sprite-url'),
            link = document.createElement('link'),
            $existing = $('#stripe-sprite'),
            $head = $('head');

        if (!$existing.length && spriteSheetUrl) {
            link.id = 'stripe-sprite';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = spriteSheetUrl;
            link.media = 'all';
            $head.append(link);
        }
    };

    StripePaymentForm.prototype.init = function () {
        this.addIconCss();
        if (this.context) {
            this.domElementSetup();
            this.addListeners();
            stripe.setPublishableKey(this.PUBLIC_STRIPE_KEY);
        }
    };

    return StripePaymentForm;
});
