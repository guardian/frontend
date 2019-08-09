// @flow
import config from 'lib/config';

export const fbPixel: () => ThirdPartyTag = () => ({
    shouldRun: config.get('switches.facebookTrackingPixel'),
    url: `https://www.facebook.com/tr?id=${config.get(
        'libs.facebookAccountId'
    )}&ev=PageView&noscript=1`,
    useImage: true,
});
