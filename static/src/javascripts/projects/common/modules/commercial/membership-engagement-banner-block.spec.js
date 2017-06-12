// @flow
import config from 'lib/config';
import { isBlocked } from './membership-engagement-banner-block';

const switches = ['ukBlock', 'usBlock'];

const switchConfigs = {
    ukBlock: {
        urls: ['/uk1', '/uk2'],
        geolocation: 'GB',
    },
    usBlock: {
        urls: ['/us1', '/us2'],
        geolocation: 'US',
    },
};

describe('Engagement Banner blocking', () => {
    beforeEach(() => {
        // disable all blocks
        config.switches.ukBlock = false;
        config.switches.usBlock = false;
    });

    it('should block correct paths when user is in a blocked geolocation', () => {
        config.switches.ukBlock = true;

        expect(isBlocked(switches, switchConfigs, '/uk1', 'GB')).toBe(true);
        expect(isBlocked(switches, switchConfigs, '/uk2', 'GB')).toBe(true);
        expect(isBlocked(switches, switchConfigs, '/us1', 'GB')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/us2', 'GB')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/e', 'GB')).toBe(false);

        config.switches.ukBlock = false;
        config.switches.usBlock = true;

        expect(isBlocked(switches, switchConfigs, '/uk1', 'US')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/uk2', 'US')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/us1', 'US')).toBe(true);
        expect(isBlocked(switches, switchConfigs, '/us2', 'US')).toBe(true);
        expect(isBlocked(switches, switchConfigs, '/e', 'US')).toBe(false);
    });

    it('should never block paths when user is not in a blocked geolocation', () => {
        config.switches.ukBlock = true;
        config.switches.usBlock = true;

        expect(isBlocked(switches, switchConfigs, '/uk1', 'US')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/uk2', 'AU')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/us1', 'AU')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/us2', 'AU')).toBe(false);
        expect(isBlocked(switches, switchConfigs, '/e', 'AU')).toBe(false);
    });
});
