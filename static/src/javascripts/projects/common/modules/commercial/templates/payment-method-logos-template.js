import config from 'lib/config';
import { getSync as getGeolocation } from 'lib/geolocation';
import { applePayApiAvailable } from 'lib/detect';
import applePayMark from 'svgs/acquisitions/apple-pay-mark.svg';

export const paymentMethodLogosTemplate = (classNames) => {
    const applePayLogo = applePayApiAvailable ? applePayMark.markup : '';
    const inUS = getGeolocation() === 'US';

    const paymentMethodLogos = config.get(
        inUS
            ? 'images.acquisitions.payment-methods-us'
            : 'images.acquisitions.payment-methods',
        ''
    );

    const paymentMethodAltText = `Accepted payment methods: Visa, Mastercard, American Express ${
        inUS ? ' Paypal, Diners Club and Discover' : ' and Paypal'
    }`;

    return `<div class= "${classNames}">
        <img
            src="${paymentMethodLogos}"
            alt="${paymentMethodAltText}"
        >
        ${applePayLogo}
    </div>`;
};
