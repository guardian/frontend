// @flow strict
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import {
    getReferrer as detectGetReferrer,
    getBreakpoint,
    getViewport,
} from 'lib/detect';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { storage } from '@guardian/libs';
import { getUrlVars } from 'lib/url';
import { getPrivacyFramework } from 'lib/getPrivacyFramework';
import { cmp, onConsentChange } from '@guardian/consent-management-platform';
import {
    getPermutiveSegments,
    clearPermutiveSegments,
} from 'common/modules/commercial/permutive';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { getUserSegments } from 'common/modules/commercial/user-ad-targeting';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getSynchronousParticipations } from 'common/modules/experiments/ab';
import { removeFalseyValues } from 'commercial/modules/header-bidding/utils';
import flattenDeep from 'lodash/flattenDeep';
import once from 'lodash/once';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';

type PageTargeting = {
    sens: string,
    url: string,
    edition: string,
    ct: string,
    p: string,
    k: string,
    su: string,
    bp: string,
    x: string,
    gdncrm: string,
    pv: string,
    co: string,
    tn: string,
    slot: string,
    permutive: string,
    urlkw: string,
};

let myPageTargetting: {} = {};
let latestConsentCanRun;

const findBreakpoint = (): string => {
    switch (getBreakpoint(true)) {
        case 'mobile':
        case 'mobileMedium':
        case 'mobileLandscape':
            return 'mobile';
        case 'phablet':
        case 'tablet':
            return 'tablet';
        case 'desktop':
        case 'leftCol':
        case 'wide':
            return 'desktop';
        default:
            return 'mobile';
    }
};

const inskinTargetting = async (): Promise<string> => {
    const vp = getViewport();
    if (vp && vp.width < 1560) {
        return 'f';
    }
    const willShowPrivacyMessage: boolean = await cmp.willShowPrivacyMessage();
    return willShowPrivacyMessage ? 't' : 'f';
};

const format = (keyword: string): string =>
    keyword.replace(/[+\s]+/g, '-').toLowerCase();

// flowlint sketchy-null-string:warn
const formatTarget = (target: ?string): ?string =>
    target
        ? format(target)
              .replace(/&/g, 'and')
              .replace(/'/g, '')
        : null;

const abParam = (): Array<string> => {
    const abParticipations: Participations = getSynchronousParticipations();
    const abParams: Array<string> = [];

    const pushAbParams = (testName: string, testValue: mixed): void => {
        if (typeof testValue === 'string' && testValue !== 'notintest') {
            const testData: string = `${testName}-${testValue}`;
            // DFP key-value pairs accept value strings up to 40 characters long
            abParams.push(testData.substring(0, 40));
        }
    };

    Object.keys(abParticipations).forEach(
        (testKey: string): void => {
            const testValue: { variant: string } = abParticipations[testKey];
            pushAbParams(testKey, testValue.variant);
        }
    );

    const tests = config.get('tests');

    if (tests) {
        Object.entries(tests).forEach(([testName, testValue]) => {
            pushAbParams(testName, testValue);
        });
    }

    return abParams;
};

const getVisitedValue = (): string => {
    const visitCount: number =
        parseInt(storage.local.getRaw('gu.alreadyVisited'), 10) || 0;

    if (visitCount <= 5) {
        return visitCount.toString();
    } else if (visitCount >= 6 && visitCount <= 9) {
        return '6-9';
    } else if (visitCount >= 10 && visitCount <= 15) {
        return '10-15';
    } else if (visitCount >= 16 && visitCount <= 19) {
        return '16-19';
    } else if (visitCount >= 20 && visitCount <= 29) {
        return '20-29';
    } else if (visitCount >= 30) {
        return '30plus';
    }

    return visitCount.toString();
};

const getReferrer = (): ?string => {
    type MatchType = { id: string, match: string };
    const referrerTypes: Array<MatchType> = [
        {
            id: 'facebook',
            match: 'facebook.com',
        },
        {
            id: 'twitter',
            match: 't.co/',
        }, // added (/) because without slash it is picking up reddit.com too
        {
            id: 'reddit',
            match: 'reddit.com',
        },
        {
            id: 'google',
            match: 'www.google',
        },
    ];

    const matchedRef: MatchType =
        referrerTypes.filter(
            referrerType => detectGetReferrer().indexOf(referrerType.match) > -1
        )[0] || {};

    return matchedRef.id;
};

const getWhitelistedQueryParams = (): {} => {
    const whiteList: Array<string> = ['0p19G'];
    return pick(getUrlVars(), whiteList);
};

const getUrlKeywords = (pageId: string): Array<string> => {
    if (pageId) {
        const segments = pageId.split('/');
        const lastPathname = segments.pop() || segments.pop(); // This handles a trailing slash
        return lastPathname.split('-');
    }
    return [];
};

const formatAppNexusTargeting = (obj: { [string]: string }): string =>
    flattenDeep(
        Object.keys(obj)
            .filter((key: string) => obj[key] !== '' && obj[key] !== null)
            .map((key: string) => {
                const value: Array<string> | string = obj[key];
                return Array.isArray(value)
                    ? value.map(nestedValue => `${key}=${nestedValue}`)
                    : `${key}=${value}`;
            })
    ).join(',');

const buildAppNexusTargetingObject = once(
    (pageTargeting: PageTargeting): {} =>
        removeFalseyValues({
            sens: pageTargeting.sens,
            pt1: pageTargeting.url,
            pt2: pageTargeting.edition,
            pt3: pageTargeting.ct,
            pt4: pageTargeting.p,
            pt5: pageTargeting.k,
            pt6: pageTargeting.su,
            pt7: pageTargeting.bp,
            pt8: pageTargeting.x, // OpenX cannot handle this being undefined
            pt9: [
                pageTargeting.gdncrm,
                pageTargeting.pv,
                pageTargeting.co,
                pageTargeting.tn,
                pageTargeting.slot,
            ].join('|'),
            permutive: pageTargeting.permutive,
        })
);

const buildAppNexusTargeting = once(
    (pageTargeting: PageTargeting): string =>
        formatAppNexusTargeting(buildAppNexusTargetingObject(pageTargeting))
);

const getRdpValue = (ccpaState: boolean | null): string => {
    if (ccpaState === null) {
        return 'na';
    }
    return ccpaState ? 't' : 'f';
};

const getTcfv2ConsentValue = (tcfv2State: boolean | null): string => {
    if (getPrivacyFramework().tcfv2 && tcfv2State !== null) {
        return tcfv2State ? 't' : 'f';
    }
    return 'na';
};

const buildPageTargetting = (
    adConsentState: boolean | null,
    ccpaState: boolean | null,
    tcfv2EventStatus: string | null
): { [key: string]: mixed } => {
    const page = config.get('page');
    // personalised ads targeting
    if (adConsentState === false) clearPermutiveSegments();
    // flowlint-next-line sketchy-null-bool:off
    const paTargeting: {} = { pa: adConsentState ? 't' : 'f' };
    const adFreeTargeting: {} = commercialFeatures.adFree ? { af: 't' } : {};
    const pageTargets: PageTargeting = Object.assign(
        {
            sens: page.isSensitive ? 't' : 'f',
            permutive: getPermutiveSegments(),
            pv: config.get('ophan.pageViewId'),
            bp: findBreakpoint(),
            at: getCookie('adtest') || undefined,
            si: isUserLoggedIn() ? 't' : 'f',
            gdncrm: getUserSegments(adConsentState),
            ab: abParam(),
            ref: getReferrer(),
            ms: formatTarget(page.source),
            fr: getVisitedValue(),
            // round video duration up to nearest 30 multiple
            vl: page.videoDuration
                ? (Math.ceil(page.videoDuration / 30.0) * 30).toString()
                : undefined,
            cc: geolocationGetSync(),
            s: page.section, // for reference in a macro, so cannot be extracted from ad unit
            rp: config.get('isDotcomRendering', false)
                ? 'dotcom-rendering'
                : 'dotcom-platform', // rendering platform
            dcre:
                config.get('isDotcomRendering', false) ||
                config.get('page.dcrCouldRender', false)
                    ? 't'
                    : 'f',
            // Indicates whether the page is DCR eligible. This happens when the page
            // was DCR eligible and was actually rendered by DCR or
            // was DCR eligible but rendered by frontend for a user not in the DotcomRendering experiment
            inskin: inskinTargetting(),
            urlkw: getUrlKeywords(page.pageId),
            rdp: getRdpValue(ccpaState),
            consent_tcfv2: getTcfv2ConsentValue(adConsentState),
            cmp_interaction: tcfv2EventStatus || 'na',
        },
        page.sharedAdTargeting,
        paTargeting,
        adFreeTargeting,
        getWhitelistedQueryParams()
    );

    // filter out empty values
    const pageTargeting: {} = pickBy(pageTargets, target => {
        if (Array.isArray(target)) {
            return target.length > 0;
        }
        return target;
    });

    // third-parties wish to access our page targeting, before the googletag script is loaded.
    page.appNexusPageTargeting = buildAppNexusTargeting(pageTargeting);

    // This can be removed once we get sign-off from third parties who prefer to use appNexusPageTargeting.
    page.pageAdTargeting = pageTargeting;

    return pageTargeting;
};

const getPageTargeting = (): { [key: string]: mixed } => {
    if (Object.keys(myPageTargetting).length !== 0) return myPageTargetting;

    onConsentChange(state => {
        let canRun: boolean | null;
        if (state.ccpa) {
            // CCPA mode
            canRun = !state.ccpa.doNotSell;
        } else if (state.tcfv2) {
            // TCFv2 mode
            canRun = state.tcfv2.consents
                ? Object.keys(state.tcfv2.consents).length > 0 &&
                  Object.values(state.tcfv2.consents).every(Boolean)
                : false;
        } else if (state.aus) {
            // AUS mode
            canRun = state.aus.personalisedAdvertising;
        } else canRun = false;

        if (canRun !== latestConsentCanRun) {
            const ccpaState = state.ccpa ? state.ccpa.doNotSell : null;
            const eventStatus = state.tcfv2 ? state.tcfv2.eventStatus : 'na';
            myPageTargetting = buildPageTargetting(
                canRun,
                ccpaState,
                eventStatus
            );
            latestConsentCanRun = canRun;
        }
    });

    return myPageTargetting;
};

const resetPageTargeting = (): void => {
    myPageTargetting = {};
    latestConsentCanRun = undefined;
};

export {
    getPageTargeting,
    buildAppNexusTargeting,
    buildAppNexusTargetingObject,
};

export const _ = {
    resetPageTargeting,
};
