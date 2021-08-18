import { cmp, onConsentChange } from '@guardian/consent-management-platform';
import { log, storage } from '@guardian/libs';
import { once, pick } from 'lodash-es';
import config from '../../../../lib/config';
import { getCookie } from '../../../../lib/cookies';
import {
    getBreakpoint,
    getReferrer as detectGetReferrer,
    getViewport,
} from '../../../../lib/detect';
import { getCountryCode } from '../../../../lib/geolocation';
import { getPrivacyFramework } from '../../../../lib/getPrivacyFramework';
import { getUrlVars } from '../../../../lib/url';
import { removeFalseyValues } from '../../../commercial/modules/header-bidding/utils';
import { getSynchronousParticipations } from '../experiments/ab';
import { isUserLoggedIn } from '../identity/api';
import { commercialFeatures } from './commercial-features';
import { clearPermutiveSegments, getPermutiveSegments } from './permutive';
import { getUserSegments } from './user-ad-targeting';

let myPageTargetting = {};
let latestCmpHasInitialised;
let latestCMPState;
const AMTGRP_STORAGE_KEY = 'gu.adManagerGroup';

const findBreakpoint = () => {
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

const skinsizeTargetting = () => {
    const vp = getViewport();
    return (vp && vp.width >= 1560) ? "l" : "s";
};

const inskinTargetting = () => {
// Don’t show inskin if we cannot tell if a privacy message will be shown
    if (!cmp.hasInitialised()) return 'f';
    return cmp.willShowPrivacyMessageSync() ? 'f' : 't';
};

const format = (keyword) =>
    keyword.replace(/[+\s]+/g, '-').toLowerCase();

// flowlint sketchy-null-string:warn
const formatTarget = (target) =>
    target
        ? format(target)
              .replace(/&/g, 'and')
              .replace(/'/g, '')
        : null;

const abParam = () => {
    const abParticipations = getSynchronousParticipations();
    const abParams = [];

    const pushAbParams = (testName, testValue) => {
        if (typeof testValue === 'string' && testValue !== 'notintest') {
            const testData = `${testName}-${testValue}`;
            // DFP key-value pairs accept value strings up to 40 characters long
            abParams.push(testData.substring(0, 40));
        }
    };

    Object.keys(abParticipations).forEach(
        (testKey) => {
            const testValue = abParticipations[testKey];
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

const getVisitedValue = () => {
    const visitCount =
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

const getReferrer = () => {
    const referrerTypes = [
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

    const matchedRef =
        referrerTypes.filter(
            referrerType => detectGetReferrer().indexOf(referrerType.match) > -1
        )[0] || {};

    return matchedRef.id;
};

const getWhitelistedQueryParams = () => {
    const whiteList = ['0p19G'];
    return pick(getUrlVars(), whiteList);
};

const getUrlKeywords = (pageId) => {
    if (pageId) {
        const segments = pageId.split('/');
        const lastPathname = segments.pop() || segments.pop(); // This handles a trailing slash
        return lastPathname.split('-');
    }
    return [];
};

const formatAppNexusTargeting = (obj) => {
    const asKeyValues = Object.keys(obj)
        .map((key) => {
            const value = obj[key];
            return Array.isArray(value)
                ? value.map(nestedValue => `${key}=${nestedValue}`)
                : `${key}=${value}`;
        });

    const flattenDeep = Array.prototype.concat.apply([], asKeyValues);
    return flattenDeep.join(',');
}

const buildAppNexusTargetingObject = once(
    (pageTargeting) =>
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
    (pageTargeting) =>
        formatAppNexusTargeting(buildAppNexusTargetingObject(pageTargeting))
);

const getRdpValue = (ccpaState) => {
    if (ccpaState === null) {
        return 'na';
    }
    return ccpaState ? 't' : 'f';
};

const getTcfv2ConsentValue = (tcfv2State) => {
    if (getPrivacyFramework().tcfv2 && tcfv2State !== null) {
        return tcfv2State ? 't' : 'f';
    }
    return 'na';
};

const getAdConsentFromState = (state) => {
    if (state.ccpa) {
        // CCPA mode
        return !state.ccpa.doNotSell;
    } else if (state.tcfv2) {
        // TCFv2 mode
        return state.tcfv2.consents
            ? Object.keys(state.tcfv2.consents).length > 0 &&
              Object.values(state.tcfv2.consents).every(Boolean)
            : false;
    } else if (state.aus) {
        // AUS mode
        return state.aus.personalisedAdvertising;
    }
    // Unknown mode
    return false;
}

const createAdManagerGroup = () => {
    // users are assigned to groups 1-12
    const group = String(Math.floor(Math.random() * 12) + 1);
    storage.local.setRaw(AMTGRP_STORAGE_KEY, group);
    return group;
}

const filterEmptyValues = (pageTargets) => {
    const filtered = {};
    for (const key in pageTargets) {
        const value = pageTargets[key];
        if (!value) {
            continue;
        }
        if (Array.isArray(value) && value.length === 0) {
            continue;
        }
        filtered[key] = value;
    }
    return filtered;
}

const rebuildPageTargeting = () => {
    latestCmpHasInitialised = cmp.hasInitialised();
    const adConsentState = getAdConsentFromState(latestCMPState);
    const ccpaState = latestCMPState.ccpa ? latestCMPState.ccpa.doNotSell : null;
    const tcfv2EventStatus = latestCMPState.tcfv2 ? latestCMPState.tcfv2.eventStatus : 'na';
    const page = config.get('page');
    // personalised ads targeting
    if (adConsentState === false) clearPermutiveSegments();
    // flowlint-next-line sketchy-null-bool:off
    const paTargeting = { pa: adConsentState ? 't' : 'f' };
    const adFreeTargeting = commercialFeatures.adFree ? { af: 't' } : {};
    const pageTargets = Object.assign(
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
            cc: getCountryCode(),
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
            skinsize: skinsizeTargetting(),
            urlkw: getUrlKeywords(page.pageId),
            rdp: getRdpValue(ccpaState),
            consent_tcfv2: getTcfv2ConsentValue(adConsentState),
            cmp_interaction: tcfv2EventStatus || 'na',
            amtgrp: storage.local.getRaw(AMTGRP_STORAGE_KEY) || createAdManagerGroup(),
        },
        page.sharedAdTargeting,
        paTargeting,
        adFreeTargeting,
        getWhitelistedQueryParams()
    );

    // filter out empty values
    const pageTargeting = filterEmptyValues(pageTargets);

    // third-parties wish to access our page targeting, before the googletag script is loaded.
    page.appNexusPageTargeting = buildAppNexusTargeting(pageTargeting);

    // This can be removed once we get sign-off from third parties who prefer to use appNexusPageTargeting.
    page.pageAdTargeting = pageTargeting;

	log('commercial', 'pageTargeting object:', pageTargeting);

    return pageTargeting;
}

const getPageTargeting = () => {

    if (Object.keys(myPageTargetting).length !== 0) {
        // If CMP was initialised since the last time myPageTargetting was built - rebuild
        if (latestCmpHasInitialised !== cmp.hasInitialised()) {
            myPageTargetting = rebuildPageTargeting();
        }
        return myPageTargetting;
    }

    // First call binds to onConsentChange and returns {}
    onConsentChange((state)=>{
    // On every consent change we rebuildPageTargeting
        latestCMPState = state;
        myPageTargetting = rebuildPageTargeting();
    });
    return myPageTargetting;
};

const resetPageTargeting = () => {
    myPageTargetting = {};
};

export {
    getPageTargeting,
    buildAppNexusTargeting,
    buildAppNexusTargetingObject,
};

export const _ = {
    resetPageTargeting,
};
