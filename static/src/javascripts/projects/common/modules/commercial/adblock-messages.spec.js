// @flow

import userFeatures from 'commercial/modules/user-features';
import detect from 'lib/detect';
import config from 'lib/config';
import { local } from 'lib/storage';
import { showAdblockMsg } from './adblock-messages';

jest.mock('commercial/modules/user-features', () => ({
    isPayingMember: jest.fn(),
}));

jest.mock('lib/detect', () => ({
    getBreakpoint: jest.fn(),
    adblockInUse: Promise.resolve(true),
}));

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(),
    },
}));

describe('Adblock messages/banners rules', () => {
    let counter = 0;
    const settings = [
        {
            adBlocker: false,
            alreadyVisited: 10,
            switch: false,
            mockhasAd: false,
            mockBreakpoint: 'desktop',
            userFeatures: false,
        },
        {
            adBlocker: true,
            alreadyVisited: 10,
            switch: true,
            mockhasAd: true,
            mockBreakpoint: 'desktop',
            userFeatures: false,
        },
    ];

    let mockBreakpoint;

    beforeEach(done => {
        userFeatures.isPayingMember.mockReturnValueOnce(
            settings[counter].userFeatures
        );

        config.switches.adblock = settings[counter].switch;
        window.guardian.adBlockers.active = settings[counter].adBlocker;
        local.get.mockReturnValueOnce(settings[counter].alreadyVisited);
        mockBreakpoint = settings[counter].mockBreakpoint;

        detect.getBreakpoint.mockReturnValueOnce(mockBreakpoint);

        done();
    });

    afterEach(() => {
        counter += 1;
        jest.resetAllMocks();
    });

    it('should not show adblock messages for non adblock users', done => {
        showAdblockMsg()
            .then(boolean => {
                expect(boolean).toBe(false);
            })
            .then(done);
    });

    it('should show adblock messages for non paying members', done => {
        showAdblockMsg()
            .then(boolean => {
                expect(boolean).toBe(true);
            })
            .then(done);
    });
});
