// @flow
import { local } from 'lib/storage';

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPageTargeting } from 'common/modules/commercial/build-page-targeting';
import config from 'lib/config';
import { getCookie as getCookie_ } from 'lib/cookies';
import {
    getReferrer as getReferrer_,
    getBreakpoint as getBreakpoint_,
} from 'lib/detect';
import { getSync as getSync_ } from 'lib/geolocation';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import { getUserSegments as getUserSegments_ } from 'common/modules/commercial/user-ad-targeting';
import { getParticipations as getParticipations_ } from 'common/modules/experiments/utils';
import { getKruxSegments as getKruxSegments_ } from 'common/modules/commercial/krux';

import { getAdConsentState as getAdConsentState_ } from 'common/modules/commercial/ad-prefs.lib';

const getAdConsentState: any = getAdConsentState_;
const getCookie: any = getCookie_;
const getUserSegments: any = getUserSegments_;
const getParticipations: any = getParticipations_;
const getKruxSegments: any = getKruxSegments_;
const getReferrer: any = getReferrer_;
const getBreakpoint: any = getBreakpoint_;
const isUserLoggedIn: any = isUserLoggedIn_;
const getSync: any = getSync_;

jest.mock('lib/storage');
jest.mock('lib/config');
jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(),
}));
jest.mock('lib/detect', () => ({
    getBreakpoint: jest.fn(),
    getReferrer: jest.fn(),
    hasPushStateSupport: jest.fn(),
}));
jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(),
}));
jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));
jest.mock('common/modules/commercial/user-ad-targeting', () => ({
    getUserSegments: jest.fn(),
}));
jest.mock('common/modules/experiments/utils', () => ({
    getParticipations: jest.fn(),
}));
jest.mock('common/modules/commercial/krux', () => ({
    getKruxSegments: jest.fn(),
}));
jest.mock('lodash/functions/once', () => fn => fn);

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures() {},
}));

describe('Build Page Targeting', () => {
    beforeEach(() => {
        config.page = {
            authorIds: 'profile/gabrielle-chan',
            blogIds: 'a/blog',
            contentType: 'Video',
            edition: 'US',
            keywordIds:
                'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
            pageId: 'football/series/footballweekly',
            publication: 'The Observer',
            seriesId: 'film/series/filmweekly',
            source: 'ITN',
            sponsorshipType: 'advertisement-features',
            tones: 'News',
            videoDuration: 63,
            sharedAdTargeting: {
                bl: ['blog'],
                br: 'p',
                co: ['gabrielle-chan'],
                ct: 'video',
                edition: 'us',
                k: ['prince-charles-letters', 'uk/uk', 'prince-charles'],
                ob: 't',
                p: 'ng',
                se: ['filmweekly'],
                su: ['5'],
                tn: ['news'],
                url: '/football/series/footballweekly',
            },
            isSensitive: false,
        };
        config.ophan = { pageViewId: 'presetOphanPageViewId' };

        commercialFeatures.adFree = false;

        // Reset mocking to default values.
        getAdConsentState.mockReturnValue(null);
        getCookie.mockReturnValue('ng101');

        getBreakpoint.mockReturnValue('mobile');
        getReferrer.mockReturnValue('');

        isUserLoggedIn.mockReturnValue(true);

        getUserSegments.mockReturnValue(['seg1', 'seg2']);

        getParticipations.mockReturnValue({
            MtMaster: {
                variant: 'variantName',
            },
        });
        getKruxSegments.mockReturnValue(['E012712', 'E012390', 'E012478']);

        local.set('gu.alreadyVisited', 0);

        getSync.mockReturnValue('US');

        expect.hasAssertions();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should exist', () => {
        expect(buildPageTargeting).toBeDefined();
    });

    it('should build correct page targeting', () => {
        const pageTargeting = buildPageTargeting();

        expect(pageTargeting.sens).toBe('f');
        expect(pageTargeting.edition).toBe('us');
        expect(pageTargeting.ct).toBe('video');
        expect(pageTargeting.p).toBe('ng');
        expect(pageTargeting.su).toEqual(['5']);
        expect(pageTargeting.bp).toBe('mobile');
        expect(pageTargeting.at).toBe('ng101');
        expect(pageTargeting.si).toEqual('t');
        expect(pageTargeting.gdncrm).toEqual(['seg1', 'seg2']);
        expect(pageTargeting.co).toEqual(['gabrielle-chan']);
        expect(pageTargeting.bl).toEqual(['blog']);
        expect(pageTargeting.ms).toBe('itn');
        expect(pageTargeting.tn).toEqual(['news']);
        expect(pageTargeting.vl).toEqual('90');
        expect(pageTargeting.pv).toEqual('presetOphanPageViewId');
        expect(pageTargeting.pa).toEqual(undefined);
        expect(pageTargeting.cc).toEqual('US');
    });

    it('should set correct personalized ad (pa) param', () => {
        getAdConsentState.mockReturnValueOnce(true);
        expect(buildPageTargeting().pa).toBe('t');

        getAdConsentState.mockReturnValueOnce(false);
        expect(buildPageTargeting().pa).toBe('f');
    });

    it('should set correct edition param', () => {
        expect(buildPageTargeting().edition).toBe('us');
    });

    it('should set correct se param', () => {
        expect(buildPageTargeting().se).toEqual(['filmweekly']);
    });

    it('should set correct k param', () => {
        expect(buildPageTargeting().k).toEqual([
            'prince-charles-letters',
            'uk/uk',
            'prince-charles',
        ]);
    });

    it('should set correct ab param', () => {
        expect(buildPageTargeting().ab).toEqual(['MtMaster-variantName']);
    });

    it('should set correct krux params', () => {
        expect(buildPageTargeting().x).toEqual([
            'E012712',
            'E012390',
            'E012478',
        ]);
    });

    it('should set Observer flag for Observer content', () => {
        expect(buildPageTargeting().ob).toEqual('t');
    });

    it('should set correct branding param for paid content', () => {
        expect(buildPageTargeting().br).toEqual('p');
    });

    it('should not contain an ad-free targeting value', () => {
        expect(buildPageTargeting().af).toBeUndefined();
    });

    it('should remove empty values', () => {
        config.page = {};
        config.ophan = { pageViewId: '123456' };
        getUserSegments.mockReturnValue([]);
        getKruxSegments.mockReturnValue([]);

        expect(buildPageTargeting()).toEqual({
            sens: 'f',
            bp: 'mobile',
            at: 'ng101',
            si: 't',
            ab: ['MtMaster-variantName'],
            pv: '123456',
            fr: '0',
            cc: 'US',
        });
    });

    describe('Build Page Targeting (ad-free)', () => {
        it('should set the ad-free param to t when enabled', () => {
            commercialFeatures.adFree = true;
            expect(buildPageTargeting().af).toBe('t');
        });
    });

    describe('Already visited frequency', () => {
        it('can pass a value of five or less', () => {
            local.set('gu.alreadyVisited', 5);
            expect(buildPageTargeting().fr).toEqual('5');
        });

        it('between five and thirty, includes it in a bucket in the form "x-y"', () => {
            local.set('gu.alreadyVisited', 18);
            expect(buildPageTargeting().fr).toEqual('16-19');
        });

        it('over thirty, includes it in the bucket "30plus"', () => {
            local.set('gu.alreadyVisited', 300);
            expect(buildPageTargeting().fr).toEqual('30plus');
        });

        it('passes a value of 0 if the value is not stored', () => {
            local.remove('gu.alreadyVisited');
            expect(buildPageTargeting().fr).toEqual('0');
        });
    });

    describe('Referrer', () => {
        it('should set ref to Facebook', () => {
            getReferrer.mockReturnValue(
                'https://www.facebook.com/feel-the-force'
            );
            expect(buildPageTargeting().ref).toEqual('facebook');
        });

        it('should set ref to Twitter', () => {
            getReferrer.mockReturnValue(
                'https://www.t.co/you-must-unlearn-what-you-have-learned'
            );
            expect(buildPageTargeting().ref).toEqual('twitter');
        });

        it('should set ref to Googleplus', () => {
            getReferrer.mockReturnValue(
                'https://plus.url.google.com/always-pass-on-what-you-have-learned'
            );
            expect(buildPageTargeting().ref).toEqual('googleplus');
        });

        it('should set ref to reddit', () => {
            getReferrer.mockReturnValue(
                'https://www.reddit.com/its-not-my-fault'
            );
            expect(buildPageTargeting().ref).toEqual('reddit');
        });

        it('should set ref to google', () => {
            getReferrer.mockReturnValue(
                'https://www.google.com/i-find-your-lack-of-faith-distrubing'
            );
            expect(buildPageTargeting().ref).toEqual('google');
        });

        it('should set ref empty string if referrer does not match', () => {
            getReferrer.mockReturnValue('https://theguardian.com');
            expect(buildPageTargeting().ref).toEqual(undefined);
        });
    });
});
