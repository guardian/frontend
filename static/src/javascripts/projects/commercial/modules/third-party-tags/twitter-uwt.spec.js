// @flow
import { twitterUwt } from 'commercial/modules/third-party-tags/twitter-uwt';
import config from 'lib/config';

describe('twitterUwt', () => {
    it('shouldRun to be true if ad the switch is on', () => {
        config.set('switches.twitterUwt', true);
        const { shouldRun, url } = twitterUwt();

        expect(shouldRun).toEqual(true);
        expect(url).toBeUndefined();
    });

    it('shouldRun to be false if the switch is off', () => {
        config.set('switches.twitterUwt', false);
        const { shouldRun, url, sourcepointId } = twitterUwt();

        expect(shouldRun).toEqual(false);
        expect(url).toBeUndefined();
        expect(sourcepointId).toBe('5e71760b69966540e4554f01');
    });

    it('should have insert body function', () => {
        config.set('switches.twitterUwt', true);
        const { insertBody  } = twitterUwt();

        expect(insertBody).toBeDefined();
    });
});
