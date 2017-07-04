// @flow
import { url, shouldRun } from 'commercial/modules/third-party-tags/krux';
import config from 'lib/config';

describe('Krux', () => {
    beforeEach(() => {
        config.switches = {
            krux: true,
        };
    });

    it('should not load if switch is off', () => {
        config.switches.krux = false;

        expect(shouldRun).toBeFalsy();
    });

    it('should send correct "netid" param', () => {
        expect(url).toBe('//cdn.krxd.net/controltag?confid=JVZiE3vn');
    });
});
