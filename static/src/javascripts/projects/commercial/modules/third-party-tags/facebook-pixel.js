// @flow
import config from 'lib/config';

export const fbPixel: () => ThirdPartyTag = () => ({
    shouldRun: config.get('switches.facebookTrackingPixel', false),
    url: `https://www.facebook.com/tr?id=${config.get(
        'libs.facebookAccountId'
    )}&ev=PageView&noscript=1`,
    sourcepointId: '5e7e1298b8e05c54a85c52d2',
    useImage: true,
});
