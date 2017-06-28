// @flow

import { register } from 'commercial/modules/messenger';
import 'commercial/modules/dfp/prepare-googletag';

jest.mock('commercial/modules/commercial-features', () => {});
jest.mock('commercial/modules/dfp/on-slot-render', () => jest.fn());
jest.mock('commercial/modules/dfp/on-slot-load', () => jest.fn());
jest.mock('commercial/modules/dfp/refresh-on-resize', () => jest.fn());
jest.mock('commercial/modules/dfp/fill-advert-slots', () => {});
jest.mock('common/modules/analytics/google', () => {});
jest.mock('lib/detect', () => ({}));
jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));
jest.mock('commercial/modules/build-page-targeting', () => ({
    buildPageTargeting: jest.fn(),
}));
jest.mock('commercial/modules/dfp/dfp-env', () => ({
    dfpEnv: jest.fn(),
}));
jest.mock('commercial/modules/dfp/performance-logging', () => ({
    addTag: jest.fn(),
    setListeners: jest.fn(),
}));
jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

describe('Prepare googletag', () => {
    it('should register listeners', () => {
        expect(register).toHaveBeenCalledTimes(7);
        expect(register).toHaveBeenCalledWith('type', expect.anything());
        expect(register).toHaveBeenCalledWith('get-styles', expect.anything());
        expect(register).toHaveBeenCalledWith('resize', expect.anything());
        expect(register).toHaveBeenCalledWith('scroll', expect.anything(), {
            persist: true,
        });
        expect(register).toHaveBeenCalledWith('viewport', expect.anything(), {
            persist: true,
        });
        expect(register).toHaveBeenCalledWith('click', expect.anything());
        expect(register).toHaveBeenCalledWith('background', expect.anything());
    });
});
