// @flow
import { twitterUwt } from 'commercial/modules/third-party-tags/twitter-uwt';
import config from 'lib/config';

describe('twitterUwt', () => {
    it('shouldRun to be true if ad the switch is on', () => {
        config.set('switches.twitterUwt', true);
        const { shouldRun, url, onLoad } = twitterUwt();

        expect(shouldRun).toEqual(true);
        expect(url).toEqual('//static.ads-twitter.com/uwt.js');
        expect(onLoad).toBeDefined();
    });

    it('shouldRun to be false if the switch is off', () => {
        config.set('switches.twitterUwt', false);
        const { shouldRun, url, onLoad, sourcepointId } = twitterUwt();

        expect(shouldRun).toEqual(false);
        expect(url).toEqual('//static.ads-twitter.com/uwt.js');
        expect(onLoad).toBeDefined();
        expect(sourcepointId).toBe('5e71760b69966540e4554f01');
    });
});
