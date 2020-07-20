// @flow strict
import config from 'lib/config';

const onLoad = () => {
    // Insert Twitter Pixel ID and Standard Event data below
    if (window.twq) {
        window.twq('init', 'nyl43');
        window.twq('track', 'PageView');
    }
};

// Twitter universal website tag code
export const twitterUwt: () => ThirdPartyTag = () => ({
    shouldRun: config.get('switches.twitterUwt', false),
    url: '//static.ads-twitter.com/uwt.js',
    sourcepointId: '5e71760b69966540e4554f01',
    onLoad,
});
