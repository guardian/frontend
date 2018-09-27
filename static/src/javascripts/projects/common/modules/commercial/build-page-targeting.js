// @flow strict
import config from 'lib/config';
import { getCookie, removeCookie } from 'lib/cookies';
import { getReferrer as detectGetReferrer, getBreakpoint } from 'lib/detect';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { local } from 'lib/storage';
import { getUrlVars } from 'lib/url';
import { getKruxSegments } from 'common/modules/commercial/krux';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { getUserSegments } from 'common/modules/commercial/user-ad-targeting';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getParticipations } from 'common/modules/experiments/utils';
import flatten from 'lodash/arrays/flatten';
import once from 'lodash/functions/once';
import pick from 'lodash/objects/pick';

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
    const abParticipations: Participations = getParticipations();
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

    if (config.tests) {
        Object.entries(config.tests).forEach(([testName, testValue]) => {
            pushAbParams(testName, testValue);
        });
    }

    return abParams;
};

const adtestParams = (): ?string => {
    const cookieAdtest: ?string = getCookie('adtest');
    if (cookieAdtest) {
        if (cookieAdtest.substring(0, 4) === 'demo') {
            removeCookie('adtest');
        }
        return cookieAdtest;
    }
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
            id: 'googleplus',
            match: 'plus.url.google',
        },
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
    flatten(
        Object.keys(obj)
            .filter((key: string) => obj[key] !== '' && obj[key] !== null)
            .map((key: string) => {
                const value: Array<string> | string = obj[key];
                return Array.isArray(value)
                    ? value.map(nestedValue => `${key}=${nestedValue}`)
                    : `${key}=${value}`;
            })
    ).join(',');

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
    invCode: ?string,
};

const buildAppNexusTargetingObject = once(
    (pageTargeting: PageTargeting): {} => ({
        sens: pageTargeting.sens,
        pt1: pageTargeting.url,
        pt2: pageTargeting.edition,
        pt3: pageTargeting.ct,
        pt4: pageTargeting.p,
        pt5: pageTargeting.k,
        pt6: pageTargeting.su,
        pt7: pageTargeting.bp,
        pt8: pageTargeting.x,
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

const buildPageTargeting = once(
    (): {} => {
        const page = config.page;
        //
        const adConsentState: boolean | null = getAdConsentState(
            thirdPartyTrackingAdConsent
        );

        // personalised ads targeting
        const paTargeting: {} =
            adConsentState !== null ? { pa: adConsentState ? 't' : 'f' } : {};
        const adFreeTargeting: {} = commercialFeatures.adFree
            ? { af: 't' }
            : {};
        const pageTargets: PageTargeting = Object.assign(
            {
                sens: page.isSensitive ? 't' : 'f',
                x: getKruxSegments(),
                pv: config.get('ophan.pageViewId'),
                bp: getBreakpoint(),
                at: adtestParams(),
                si: isUserLoggedIn() ? 't' : 'f',
                gdncrm: getUserSegments(),
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
            },
            page.sharedAdTargeting,
            paTargeting,
            adFreeTargeting,
            getWhitelistedQueryParams()
        );

        // filter out empty values
        const pageTargeting: {} = pick(pageTargets, target => {
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
    }
);

export {
    buildPageTargeting,
    buildAppNexusTargeting,
    buildAppNexusTargetingObject,
};
