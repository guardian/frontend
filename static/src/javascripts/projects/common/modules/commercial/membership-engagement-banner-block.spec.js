// @flow
import config from 'lib/config';
import { isBlocked } from './membership-engagement-banner-block';

const switches = ['foo', 'bar'];

const switchUrls = {
    foo: ['/a', '/b'],
    bar: ['/c', '/d'],
};

describe('Engagement Banner blocking', () => {
    it('should block correctly', () => {
        config.switches.foo = true;
        config.switches.bar = false;

        expect(isBlocked(switches, switchUrls, '/a')).toBe(true);
        expect(isBlocked(switches, switchUrls, '/b')).toBe(true);
        expect(isBlocked(switches, switchUrls, '/c')).toBe(false);
        expect(isBlocked(switches, switchUrls, '/d')).toBe(false);
        expect(isBlocked(switches, switchUrls, '/e')).toBe(false);

        config.switches.foo = false;
        config.switches.bar = true;

        expect(isBlocked(switches, switchUrls, '/a')).toBe(false);
        expect(isBlocked(switches, switchUrls, '/b')).toBe(false);
        expect(isBlocked(switches, switchUrls, '/c')).toBe(true);
        expect(isBlocked(switches, switchUrls, '/d')).toBe(true);
        expect(isBlocked(switches, switchUrls, '/e')).toBe(false);
    });
});
