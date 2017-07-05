// @flow
import { url, shouldRun } from 'commercial/modules/third-party-tags/krux';

jest.mock('lib/config', () => ({
    switches: { krux: false },
}));

describe('Krux', () => {
    it('should not load if switch is off', () => {
        expect(shouldRun).toBe(false);
    });

    it('should send correct "netid" param', () => {
        expect(url).toBe('//cdn.krxd.net/controltag?confid=JVZiE3vn');
    });
});
