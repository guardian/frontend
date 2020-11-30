// @flow
import { storage } from '@guardian/libs';

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import config from 'lib/config';
import { getCookie as getCookie_ } from 'lib/cookies';
import {
    getReferrer as getReferrer_,
    getBreakpoint as getBreakpoint_,
} from 'lib/detect';
import { getSync as getSync_ } from 'lib/geolocation';
import { getPrivacyFramework as getPrivacyFramework_ } from 'lib/getPrivacyFramework';
import { isUserLoggedIn as isUserLoggedIn_ } from 'common/modules/identity/api';
import { getUserSegments as getUserSegments_ } from 'common/modules/commercial/user-ad-targeting';
import { getSynchronousParticipations as getSynchronousParticipations_ } from 'common/modules/experiments/ab';
import { cmp } from '@guardian/consent-management-platform';

const getCookie: any = getCookie_;
const getUserSegments: any = getUserSegments_;
const getSynchronousParticipations: any = getSynchronousParticipations_;
const getReferrer: any = getReferrer_;
const getBreakpoint: any = getBreakpoint_;
const isUserLoggedIn: any = isUserLoggedIn_;
const getSync: any = getSync_;
const getPrivacyFramework: any = getPrivacyFramework_;

jest.mock('lib/config');
jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(),
}));
jest.mock('lib/detect', () => ({
    getViewport: jest.fn(),
    getBreakpoint: jest.fn(),
    getReferrer: jest.fn(),
    hasPushStateSupport: jest.fn(),
}));
jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(),
}));
jest.mock('lib/getPrivacyFramework', () => ({
    getPrivacyFramework: jest.fn(),
}));
jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(),
}));
jest.mock('common/modules/commercial/user-ad-targeting', () => ({
    getUserSegments: jest.fn(),
}));
jest.mock('common/modules/experiments/ab', () => ({
    getSynchronousParticipations: jest.fn(),
}));
jest.mock('lodash/once', () => fn => fn);
jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures() {},
}));
jest.mock('@guardian/consent-management-platform', () => ({
    cmp: {
        willShowPrivacyMessage: jest.fn(),
    },
}));

// TCFv1
const tcfWithConsentMock = {
    '1': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true,
};
const tcfMixedConsentMock = {
    '1': false,
    '2': true,
    '3': true,
    '4': false,
    '5': true,
};

// CCPA
const ccpaWithConsentMock = { ccpa: { doNotSell: false } };
const ccpaWithoutConsentMock = { ccpa: { doNotSell: true } };

// TCFv2
const tcfv2WithConsentMock = {
    tcfv2: {
        consents: { '1': true, '2': true },
        eventStatus: 'useractioncomplete',
    },
};
const tcfv2WithoutConsentMock = {
    tcfv2: { consents: {}, eventStatus: 'cmpuishown' },
};
const tcfv2NullConsentMock = { tcfv2: {} };
const tcfv2MixedConsentMock = {
    tcfv2: {
        consents: { '1': false, '2': true },
        eventStatus: 'useractioncomplete',
    },
};

describe('Build Page Targeting', () => {
    beforeEach(async () => {
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
        getCookie.mockReturnValue('ng101');

        getBreakpoint.mockReturnValue('mobile');
        getReferrer.mockReturnValue('');

        isUserLoggedIn.mockReturnValue(true);

        getUserSegments.mockReturnValue(['seg1', 'seg2']);

        getSynchronousParticipations.mockReturnValue({
            MtMaster: {
                variant: 'variantName',
            },
        });

        storage.local.setRaw('gu.alreadyVisited', 0);

        getSync.mockReturnValue('US');
        getPrivacyFramework.mockReturnValue({ ccpa: true });
        cmp.willShowPrivacyMessage.mockResolvedValue(true);

        expect.hasAssertions();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should exist', () => {
        expect(getPageTargeting).toBeDefined();
    });

    it('should build correct page targeting', async () => {
        const pageTargeting = await getPageTargeting(tcfv2NullConsentMock);

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
        expect(pageTargeting.pa).toEqual('f');
        expect(pageTargeting.cc).toEqual('US');
        expect(pageTargeting.rp).toEqual('dotcom-platform');
    });

    it('should set correct personalized ad (pa) param', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).pa).toBe('t');

        expect((await getPageTargeting(tcfv2WithoutConsentMock)).pa).toBe('f');

        expect((await getPageTargeting(tcfv2NullConsentMock)).pa).toBe('f');

        expect((await getPageTargeting(tcfv2MixedConsentMock)).pa).toBe('f');

        expect((await getPageTargeting(ccpaWithConsentMock)).pa).toBe('t');

        expect((await getPageTargeting(ccpaWithoutConsentMock)).pa).toBe('f');
    });

    it('Should correctly set the RDP flag (rdp) param', async () => {
        expect((await getPageTargeting(tcfWithConsentMock)).rdp).toBe('na');

        expect((await getPageTargeting(tcfv2WithoutConsentMock)).rdp).toBe(
            'na'
        );

        expect((await getPageTargeting(tcfv2NullConsentMock)).rdp).toBe('na');

        expect((await getPageTargeting(tcfMixedConsentMock)).rdp).toBe('na');

        expect((await getPageTargeting(ccpaWithConsentMock)).rdp).toBe('f');

        expect((await getPageTargeting(ccpaWithoutConsentMock)).rdp).toBe('t');
    });

    it('Should correctly set the TCFv2 (consent_tcfv2, cmp_interaction) params', async () => {
        getPrivacyFramework.mockReturnValue({ tcfv2: true });

        let mockState;
        mockState = tcfv2WithConsentMock;

        expect((await getPageTargeting(mockState)).consent_tcfv2).toBe('t');
        expect((await getPageTargeting(mockState)).cmp_interaction).toBe(
            'useractioncomplete'
        );

        mockState = tcfv2WithoutConsentMock;

        expect((await getPageTargeting(mockState)).consent_tcfv2).toBe('f');
        expect((await getPageTargeting(mockState)).cmp_interaction).toBe(
            'cmpuishown'
        );

        mockState = tcfv2MixedConsentMock;

        expect((await getPageTargeting(mockState)).consent_tcfv2).toBe('f');
        expect((await getPageTargeting(mockState)).cmp_interaction).toBe(
            'useractioncomplete'
        );

        getPrivacyFramework.mockReturnValue({ tcfv1: true });
        mockState = tcfWithConsentMock;

        expect((await getPageTargeting(mockState)).consent_tcfv2).toBe('na');
        expect((await getPageTargeting(mockState)).cmp_interaction).toBe('na');
    });

    it('should set correct edition param', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).edition).toBe(
            'us'
        );
    });

    it('should set correct se param', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).se).toEqual([
            'filmweekly',
        ]);
    });

    it('should set correct k param', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).k).toEqual([
            'prince-charles-letters',
            'uk/uk',
            'prince-charles',
        ]);
    });

    it('should set correct ab param', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).ab).toEqual([
            'MtMaster-variantName',
        ]);
    });

    it('should set Observer flag for Observer content', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).ob).toEqual('t');
    });

    it('should set correct branding param for paid content', async () => {
        expect((await getPageTargeting(tcfv2WithConsentMock)).br).toEqual('p');
    });

    it('should not contain an ad-free targeting value', async () => {
        expect(
            (await getPageTargeting(tcfv2WithConsentMock)).af
        ).toBeUndefined();
    });

    it('should remove empty values', async () => {
        config.page = {};
        config.ophan = { pageViewId: '123456' };
        getUserSegments.mockReturnValue([]);

        expect(await getPageTargeting(tcfv2NullConsentMock)).toEqual({
            sens: 'f',
            bp: 'mobile',
            at: 'ng101',
            si: 't',
            ab: ['MtMaster-variantName'],
            pv: '123456',
            fr: '0',
            inskin: 'f',
            pa: 'f',
            cc: 'US',
            rp: 'dotcom-platform',
            dcre: 'f',
            rdp: 'na',
            consent_tcfv2: 'na',
            cmp_interaction: 'na',
        });
    });

    describe('Breakpoint targeting', () => {
        it('should set correct breakpoint targeting for a mobile device', async () => {
            getBreakpoint.mockReturnValue('mobile');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'mobile'
            );
        });

        it('should set correct breakpoint targeting for a medium mobile device', async () => {
            getBreakpoint.mockReturnValue('mobileMedium');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'mobile'
            );
        });

        it('should set correct breakpoint targeting for a mobile device in landscape mode', async () => {
            getBreakpoint.mockReturnValue('mobileLandscape');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'mobile'
            );
        });

        it('should set correct breakpoint targeting for a phablet device', async () => {
            getBreakpoint.mockReturnValue('phablet');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'tablet'
            );
        });

        it('should set correct breakpoint targeting for a tablet device', async () => {
            getBreakpoint.mockReturnValue('tablet');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'tablet'
            );
        });

        it('should set correct breakpoint targeting for a desktop device', async () => {
            getBreakpoint.mockReturnValue('desktop');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'desktop'
            );
        });

        it('should set correct breakpoint targeting for a leftCol device', async () => {
            getBreakpoint.mockReturnValue('leftCol');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'desktop'
            );
        });

        it('should set correct breakpoint targeting for a wide device', async () => {
            getBreakpoint.mockReturnValue('wide');
            expect((await getPageTargeting(tcfv2NullConsentMock)).bp).toEqual(
                'desktop'
            );
        });
    });

    describe('Build Page Targeting (ad-free)', () => {
        it('should set the ad-free param to t when enabled', async () => {
            commercialFeatures.adFree = true;
            expect((await getPageTargeting(tcfv2NullConsentMock)).af).toBe('t');
        });
    });

    describe('Already visited frequency', () => {
        it('can pass a value of five or less', async () => {
            storage.local.setRaw('gu.alreadyVisited', 5);
            expect((await getPageTargeting(tcfv2NullConsentMock)).fr).toEqual(
                '5'
            );
        });

        it('between five and thirty, includes it in a bucket in the form "x-y"', async () => {
            storage.local.setRaw('gu.alreadyVisited', 18);
            expect((await getPageTargeting(tcfv2NullConsentMock)).fr).toEqual(
                '16-19'
            );
        });

        it('over thirty, includes it in the bucket "30plus"', async () => {
            storage.local.setRaw('gu.alreadyVisited', 300);
            expect((await getPageTargeting(tcfv2NullConsentMock)).fr).toEqual(
                '30plus'
            );
        });

        it('passes a value of 0 if the value is not stored', async () => {
            storage.local.remove('gu.alreadyVisited');
            expect((await getPageTargeting(tcfv2NullConsentMock)).fr).toEqual(
                '0'
            );
        });
    });

    describe('Referrer', () => {
        it('should set ref to Facebook', async () => {
            getReferrer.mockReturnValue(
                'https://www.facebook.com/feel-the-force'
            );
            expect((await getPageTargeting(tcfv2NullConsentMock)).ref).toEqual(
                'facebook'
            );
        });

        it('should set ref to Twitter', async () => {
            getReferrer.mockReturnValue(
                'https://www.t.co/you-must-unlearn-what-you-have-learned'
            );
            expect((await getPageTargeting(tcfv2NullConsentMock)).ref).toEqual(
                'twitter'
            );
        });

        it('should set ref to reddit', async () => {
            getReferrer.mockReturnValue(
                'https://www.reddit.com/its-not-my-fault'
            );
            expect((await getPageTargeting(tcfv2NullConsentMock)).ref).toEqual(
                'reddit'
            );
        });

        it('should set ref to google', async () => {
            getReferrer.mockReturnValue(
                'https://www.google.com/i-find-your-lack-of-faith-distrubing'
            );
            expect((await getPageTargeting(tcfv2NullConsentMock)).ref).toEqual(
                'google'
            );
        });

        it('should set ref empty string if referrer does not match', async () => {
            getReferrer.mockReturnValue('https://theguardian.com');
            expect((await getPageTargeting(tcfv2NullConsentMock)).ref).toEqual(
                undefined
            );
        });
    });

    describe('URL Keywords', () => {
        it('should return correct keywords from pageId', async () => {
            const pageTargeting = await getPageTargeting(tcfv2NullConsentMock);
            expect(pageTargeting.urlkw).toEqual(['footballweekly']);
        });

        it('should extract multiple url keywords correctly', async () => {
            config.page.pageId =
                'stage/2016/jul/26/harry-potter-cursed-child-review-palace-theatre-london';
            expect(
                (await getPageTargeting(tcfv2NullConsentMock)).urlkw
            ).toEqual([
                'harry',
                'potter',
                'cursed',
                'child',
                'review',
                'palace',
                'theatre',
                'london',
            ]);
        });

        it('should get correct keywords when trailing slash is present', async () => {
            config.page.pageId =
                'stage/2016/jul/26/harry-potter-cursed-child-review-palace-theatre-london/';
            expect(
                (await getPageTargeting(tcfv2NullConsentMock)).urlkw
            ).toEqual([
                'harry',
                'potter',
                'cursed',
                'child',
                'review',
                'palace',
                'theatre',
                'london',
            ]);
        });
    });

    describe('asynchronous setting', () => {
        it('will return the targetting object on the first run', async () => {
            let myPageTargetting = await getPageTargeting(
                tcfv2WithoutConsentMock
            );

            expect(myPageTargetting.pv).toEqual('presetOphanPageViewId');
            expect(myPageTargetting.pa).toEqual('f');
            expect(myPageTargetting.rp).toEqual('dotcom-platform');
            expect(myPageTargetting.edition).toEqual('us');

            config.page.sharedAdTargeting.edition = 'au';
            myPageTargetting = await getPageTargeting(tcfv2WithoutConsentMock);

            expect(myPageTargetting.edition).toEqual('au');
            myPageTargetting = await getPageTargeting(tcfv2WithConsentMock);

            // Only when we change the consent will the targetting change
            expect(myPageTargetting.edition).toEqual('au');
        });
    });
});
