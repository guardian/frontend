/*eslint-disable camelcase*/
define([
    'membership/payment-form',
    'common/utils/$',
    'stripe',
    'membership/stripe-error-messages',
    'text!fixtures/membership/paymentForm.fixture.html'
], function (
    PaymentForm,
    $,
    stripe,
    stripeErrorMessages,
    paymentFormHtml
) {
    describe('Payment form module', function () {

        var NEW_LINE_CHARACTER = '\n',
            TEST_ERROR_MESSAGE = 'a test error message',
            VALID_CREDIT_CARD_NUMBER = '4242424242424242',
            INVALID_CREDIT_CARD_NUMBER = '1234123412341234',
            VALID_CVC_NUMBER = '123',
            EMPTY_ARRAY = [],
            EMPTY_STRING = '',
            creditCardNumbers = {
                visa: '4242424242424242',
                mastercard: '5555555555554444',
                american_express: '371449635398431',
                discover: '6011000990139424',
                diners_club: '38520000023237',
                jcb: '3566002020360505'
            },
            stripeErrorObjects = {
                valid: {type: 'card_error', code: 'incorrect_number'},
                declinedCard: {type: 'card_error', code: 'card_declined', decline_code: 'card_not_supported'},
                invalid: {type: 'captain_haddock', code: 'tintin'}
            },
            paymentForm,
            paymentFormFixtureElement = null,
            errorMessageContainer,
            creditCardNumberInputElement,
            creditCardVerificationCodeInputElement,
            submitButtonElement,
            errorMessageDisplayElement,
            creditCardImageElement,
            expiryMonthElement,
            expiryYearElement,
            now;

        function triggerEvent(element, eventType) {
            var event;
            event = document.createEvent('HTMLEvents');
            event.initEvent(eventType, true, true);
            event.eventName = eventType;
            element.dispatchEvent(event);
        }

        beforeEach(function () {
            paymentFormFixtureElement = $.create(paymentFormHtml)[0];
            paymentForm = new PaymentForm(paymentFormFixtureElement, '', '');

            errorMessageContainer = paymentFormFixtureElement.querySelectorAll('.js-payment-errors')[0];
            creditCardNumberInputElement = paymentFormFixtureElement.querySelectorAll('.js-credit-card-number')[0];
            creditCardVerificationCodeInputElement = paymentFormFixtureElement.querySelectorAll('.js-credit-card-cvc')[0];
            submitButtonElement = paymentFormFixtureElement.querySelectorAll('.js-manage-account-change-cc-submit')[0];
            errorMessageDisplayElement = paymentFormFixtureElement.querySelectorAll('.js-payment-errors')[0];
            creditCardImageElement = paymentFormFixtureElement.querySelectorAll('.js-credit-card-image')[0];
            expiryMonthElement = paymentFormFixtureElement.querySelectorAll('.js-credit-card-exp-month')[0];
            expiryYearElement = paymentFormFixtureElement.querySelectorAll('.js-credit-card-exp-year')[0];
            now = new Date();
        });

        afterEach(function () {
            paymentForm = null;
            paymentFormFixtureElement = null;
            errorMessageContainer = null;
            submitButtonElement.removeAttribute('disabled');
            expiryMonthElement.selectedIndex = 0;
            expiryYearElement.selectedIndex = 0;
        });

        it('should correctly initialise itself', function () {
            expect(paymentForm.context).toEqual(paymentFormFixtureElement);
            expect(paymentForm.DOM.CREDIT_CARD_NUMBER).toEqual(paymentFormFixtureElement.querySelector('.js-credit-card-number'));
        });

        it('should add CSS icons to the head only once', function () {
            paymentForm.addIconCss();
            paymentForm.addIconCss();
            expect($('head link[href="test/sprite/url"]').length).toBe(1);
        });

        it('should display an error message', function () {
            paymentForm.handleErrors([TEST_ERROR_MESSAGE]);

            expect(errorMessageDisplayElement.innerHTML).toEqual(TEST_ERROR_MESSAGE + NEW_LINE_CHARACTER);
            expect(submitButtonElement.hasAttribute('disabled')).toBeTruthy();
        });

        it('should not display an error message', function () {
            paymentForm.handleErrors(EMPTY_ARRAY);

            expect(errorMessageDisplayElement.innerHTML).toEqual('');
            expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeTruthy();
            expect(submitButtonElement.hasAttribute('disabled')).toBeFalsy();
        });

        it('should detect an invalid credit card number', function () {
            creditCardNumberInputElement.value = INVALID_CREDIT_CARD_NUMBER;
            triggerEvent(creditCardNumberInputElement, 'blur');

            expect(errorMessageDisplayElement.innerHTML).toEqual(stripeErrorMessages.card_error.incorrect_number + NEW_LINE_CHARACTER);
            expect(submitButtonElement.hasAttribute('disabled')).toBeTruthy();
        });

        it('should allow a valid credit card number', function () {
            creditCardNumberInputElement.value = VALID_CREDIT_CARD_NUMBER;
            triggerEvent(creditCardNumberInputElement, 'blur');

            expect(errorMessageDisplayElement.innerHTML).toEqual(EMPTY_STRING);
            expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeTruthy();
            expect(submitButtonElement.hasAttribute('disabled')).toBeFalsy();
        });

        it('should detect an invalid Card Verification Code number', function () {
            creditCardVerificationCodeInputElement.value = EMPTY_STRING;
            triggerEvent(creditCardVerificationCodeInputElement, 'blur');

            expect(errorMessageDisplayElement.innerHTML).toEqual(stripeErrorMessages.card_error.incorrect_cvc + NEW_LINE_CHARACTER);
            expect(submitButtonElement.hasAttribute('disabled')).toBeTruthy();
        });

        it('should allow a valid Card Verification Code number', function () {
            creditCardVerificationCodeInputElement.value = VALID_CVC_NUMBER;
            triggerEvent(creditCardVerificationCodeInputElement, 'blur');

            expect(errorMessageDisplayElement.innerHTML).toEqual(EMPTY_STRING);
            expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeTruthy();
            expect(submitButtonElement.hasAttribute('disabled')).toBeFalsy();
        });

        it('should prevent submission of an empty form', function () {
            triggerEvent(paymentFormFixtureElement, 'submit');

            expect(errorMessageContainer.innerHTML).toEqual(
                [
                        stripeErrorMessages.card_error.incorrect_number + NEW_LINE_CHARACTER,
                        stripeErrorMessages.card_error.incorrect_cvc + NEW_LINE_CHARACTER,
                        stripeErrorMessages.card_error.invalid_expiry + NEW_LINE_CHARACTER
                ].join('')
            );
            expect(submitButtonElement.hasAttribute('disabled')).toBeTruthy();
        });

        it('should add correct card type class to credit card image element', function () {
            var cardType;

            for (cardType in creditCardNumbers) {

                paymentForm.displayCardTypeImage(creditCardNumbers[cardType]);
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // Divergent from membership tests here as card image is displayed using class rather than data attribute //
                expect($(creditCardImageElement).hasClass('i-' + cardType.replace('_', '-'))).toEqual(true);
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////
                expect(errorMessageDisplayElement.innerHTML).toEqual(EMPTY_STRING);
                expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeTruthy();
                expect(submitButtonElement.hasAttribute('disabled')).toBeFalsy();
            }
        });

        it('correct error returned from stripeErrorMessages via getErrorMessage', function () {
            var stripeErrorMessage = paymentForm.getErrorMessage(stripeErrorObjects.valid);

            expect(stripeErrorMessage).toEqual(stripeErrorMessages.card_error.incorrect_number);
        });

        it('undefined returned from stripeErrorMessages via getErrorMessage for invalid stripe error object', function () {
            var stripeErrorMessage = paymentForm.getErrorMessage(stripeErrorObjects.invalid);

            expect(stripeErrorMessage).toEqual(stripeErrorMessages.generic_error);
        });

        it('correct error returned from stripeErrorMessages via getErrorMessage for declined_card', function () {
            var stripeErrorMessage = paymentForm.getErrorMessage(stripeErrorObjects.declinedCard);

            expect(stripeErrorMessage).toEqual(stripeErrorMessages.card_error.card_declined.card_not_supported);
        });

        it('no error when year does not have an entry and month does', function () {
            expiryMonthElement.value = 2;
            expiryYearElement.selectedIndex = 0;
            triggerEvent(expiryMonthElement, 'blur');

            expect(errorMessageDisplayElement.innerHTML).toEqual(EMPTY_STRING);
            expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeTruthy();
            expect(submitButtonElement.hasAttribute('disabled')).toBeFalsy();
        });

        it('error when month does have an entry and year does not', function () {
            expiryMonthElement.value = 2;
            expiryYearElement.selectedIndex = 0;
            triggerEvent(expiryYearElement, 'change');

            expect(errorMessageDisplayElement.innerHTML).toEqual(stripeErrorMessages.card_error.invalid_expiry + NEW_LINE_CHARACTER);
            expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeFalsy();
            expect(submitButtonElement.hasAttribute('disabled')).toBeTruthy();
        });

        it('error when month is in the past', function () {

            var currentMonth = now.getMonth() + 1,
                currentYear = now.getFullYear();

            expiryMonthElement.value = currentMonth - 1;
            expiryYearElement.value = currentYear;

            triggerEvent(expiryYearElement, 'change');

            expect(errorMessageDisplayElement.innerHTML).toEqual(stripeErrorMessages.card_error.invalid_expiry + NEW_LINE_CHARACTER);
            expect(errorMessageDisplayElement.classList.contains('is-hidden')).toBeFalsy();
            expect(submitButtonElement.hasAttribute('disabled')).toBeTruthy();
        });

        it('should create and try to submit a stripe customer object', function () {

            var paymentDetails = {
                number : '4242424242424242',
                cvc : '123',
                exp_month : '5',
                exp_year : '2020'
            };

            spyOn(stripe.card, 'createToken');

            expiryMonthElement.value = paymentDetails.exp_month;
            expiryYearElement.value = paymentDetails.exp_year;
            creditCardNumberInputElement.value = paymentDetails.number;
            creditCardVerificationCodeInputElement.value = paymentDetails.cvc;

            triggerEvent(paymentFormFixtureElement, 'submit');

            expect(stripe.card.createToken).toHaveBeenCalled();
            expect(stripe.card.createToken.calls.count()).toEqual(1);
            expect(stripe.card.createToken.calls.argsFor(0)[0]).toEqual(paymentDetails);
        });

    });
});

