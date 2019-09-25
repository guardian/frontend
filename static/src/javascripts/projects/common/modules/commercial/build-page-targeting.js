// @flow strict
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import {
    getReferrer as detectGetReferrer,
    getBreakpoint,
    getViewport,
} from 'lib/detect';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { local } from 'lib/storage';
import { getUrlVars } from 'lib/url';
import { getKruxSegments } from 'common/modules/commercial/krux';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { getUserSegments } from 'common/modules/commercial/user-ad-targeting';
import { onIabConsentNotification } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getSynchronousParticipations } from 'common/modules/experiments/ab';
import { removeFalseyValues } from 'commercial/modules/prebid/utils';
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
};

let myPageTargetting: {} = {};
let latestConsentState;

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

const inskinTargetting = (): string => {
    const vp = getViewport();
    if (vp && vp.width >= 1560) return 't';
    return 'f';
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
    const visitCount: number = local.get('gu.alreadyVisited') || 0;

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
        })
);

const buildAppNexusTargeting = once(
    (pageTargeting: PageTargeting): string =>
        formatAppNexusTargeting(buildAppNexusTargetingObject(pageTargeting))
);

const buildPageTargetting = (
    adConsentState: boolean | null
): { [key: string]: mixed } => {
    const page = config.get('page');
    // personalised ads targeting
    // flowlint-next-line sketchy-null-bool:off
    const paTargeting: {} = { pa: adConsentState ? 't' : 'f' };
    const adFreeTargeting: {} = commercialFeatures.adFree ? { af: 't' } : {};
    const pageTargets: PageTargeting = Object.assign(
        {
            sens: page.isSensitive ? 't' : 'f',
            x: getKruxSegments(adConsentState),
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
            inskin: inskinTargetting(),
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

    onIabConsentNotification(state => {
        const consentState =
            state[1] && state[2] && state[3] && state[4] && state[5];

        if (consentState !== latestConsentState) {
            myPageTargetting = buildPageTargetting(consentState);
            latestConsentState = consentState;
        }
    });

    return myPageTargetting;
};

const resetPageTargeting = (): void => {
    myPageTargetting = {};
    latestConsentState = undefined;
};

export {
    getPageTargeting,
    buildAppNexusTargeting,
    buildAppNexusTargetingObject,
};

export const _ = {
    resetPageTargeting,
};
