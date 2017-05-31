// @flow

import userFeatures from 'projects/commercial/modules/user-features';
import detect from 'lib/detect';
import config from 'lib/config';
import { local } from 'lib/storage';
import { noAdblockMsg, showAdblockMsg } from './adblock-messages';

jest.mock('projects/commercial/modules/user-features', () => ({
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
            adBlocker: true,
            alreadyVisited: 0,
            switch: true,
            mockhasAd: true,
            mockBreakpoint: 'desktop',
            userFeatures: false,
        },
        {
            adBlocker: true,
            alreadyVisited: 10,
            switch: false,
            mockhasAd: true,
            mockBreakpoint: 'desktop',
            userFeatures: false,
        },
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
            userFeatures: true,
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

    it('should not show adblock messages for the first time users', done => {
        noAdblockMsg()
            .then(boolean => {
                expect(boolean).toBe(true);
            })
            .then(done);
    });

    it('should not show adblock messages when the adblock switch is off', done => {
        noAdblockMsg()
            .then(boolean => {
                expect(boolean).toBe(true);
            })
            .then(done);
    });

    it('should not show adblock messages for non adblock users', done => {
        showAdblockMsg()
            .then(boolean => {
                expect(boolean).toBe(false);
            })
            .then(done);
    });

    it('should not show adblock messages for paying members', done => {
        noAdblockMsg()
            .then(boolean => {
                expect(boolean).toBe(true);
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
