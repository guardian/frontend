// @flow
import config from 'lib/config';

export const twitterPixel: () => ThirdPartyTag = () => ({
    shouldRun: config.get('switches.twitterTrackingPixel', false),
    url: '',
    useImage: true,
});
