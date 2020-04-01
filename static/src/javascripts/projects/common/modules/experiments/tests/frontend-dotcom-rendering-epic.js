// @flow

import { getBodyEnd } from '@guardian/automat-client';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import {
    makeEpicABTest,
    setupOnView,
    emitBeginEvent,
    setupClickHandling,
    emitInsertEvent,
} from 'common/modules/commercial/contributions-utilities';
import reportError from 'lib/report-error';
import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';

import {
    getLastOneOffContributionDate,
    isRecurringContributor,
    shouldNotBeShownSupportMessaging,
} from 'common/modules/commercial/user-features';

const campaignId = 'frontend_dotcom_rendering_epic';
const geolocation = geolocationGetSync();

const buildKeywordTags = page => {
    const keywordIds = page.keywordIds.split(',');
    const keywords = page.keywords.split(',');
    return keywordIds.map((id, idx) => ({
        id,
        type: 'Keyword',
        title: keywords[idx],
    }));
};

const checkResponseOk = response => {
    if (response.ok) {
        return response;
    }

    throw new Error(
        `Contributions fetch failed with response code: ${response.status}`
    );
};

const decodeJson = response => response.json();

const products = ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'];

const canRun = (): boolean =>
    geolocation !== 'US' &&
    config.get('page').dcrCouldRender &&
    config.get('tests').dotcomRenderingControl === 'control';

const frontendDotcomRenderingTest = {
    id: 'FrontendDotcomRenderingEpic',
    campaignId,

    highPriority: true,

    start: '2020-03-13',
    expiry: '2020-05-13',

    author: 'Andre Silva',
    description:
        'A/B test Default Epic on Frontend vs DCR, both from a remote source, to compare Epic performance.',
    successMeasure: 'Conversion rate',
    idealOutcome: 'No difference between control and variant',

    audienceCriteria: 'All',

    // Setting audience to 100% but relying on canRun function to apply relevant
    // exclusions
    audience: 1,
    audienceOffset: 0,

    geolocation,

    canRun,

    variants: [
        {
            id: 'frontend',
            products,
            // eslint-disable-next-line import/no-shadow
            test: (html: string, variant: EpicVariant, test: EpicABTest) => {
                const ophan = config.get('ophan');
                const page = config.get('page');

                // note, there is a race condition so we want to fetch this as late as possible to give a change for the geo local storage value to be set
                const countryCode = geolocationGetSync();

                const tracking = {
                    ophanPageId: ophan.pageViewId,
                    ophanComponentId: 'ACQUISITIONS_EPIC',
                    platformId: 'GUARDIAN_WEB',
                    clientName: 'frontend',
                    campaignCode: variant.campaignCode,
                    abTestName: test.id,
                    abTestVariant: variant.id,
                    referrerUrl:
                        window.location.origin + window.location.pathname,
                };

                const localisation = {
                    countryCode,
                };

                const targeting = {
                    contentType: page.contentType,
                    sectionName: page.section,
                    shouldHideReaderRevenue: page.shouldHideReaderRevenue,
                    isMinuteArticle: config.hasTone('Minute'),
                    isPaidContent: page.isPaidContent,
                    isSensitive: page.isSensitive,
                    tags: buildKeywordTags(page),
                    // This test is already subjected to the 3 checks below, but
                    // we're passing these properties to the Contributions
                    // service for consistency with DCR.
                    showSupportMessaging: !shouldNotBeShownSupportMessaging(),
                    isRecurringContributor: isRecurringContributor(),
                    lastOneOffContributionDate: getLastOneOffContributionDate(),
                    mvtId: getMvtValue(),
                    countryCode,
                };

                const payload = {
                    tracking,
                    localisation,
                    targeting,
                };

                const trackingCampaignId = `epic_${campaignId}`; // note exposed on ABTest unfortunately

                emitBeginEvent(trackingCampaignId);

                setupClickHandling(
                    test,
                    variant.campaignCode,
                    products,
                    variant.id
                );

                getBodyEnd(payload)
                    .then(checkResponseOk)
                    .then(decodeJson)
                    .then(json => {
                        if (json && json.data) {
                            const epicHtml = json.data.html;
                            const css = json.data.css;
                            const content = `<style>${css}</style>${epicHtml}`;

                            return fastdom.write(() => {
                                const target = document.querySelector(
                                    '.submeta'
                                );

                                if (!target) {
                                    reportError(
                                        new Error(
                                            'Could not find target element for Epic'
                                        ),
                                        {},
                                        false
                                    );
                                    return;
                                }

                                const parent = target.parentNode;

                                if (!parent) {
                                    return;
                                }

                                const container = document.createElement('div');
                                parent.insertBefore(container, target);

                                // use Shadow Dom if found
                                if (container.attachShadow) {
                                    console.log('epic - has shadow dom');
                                    const shadowRoot = container.attachShadow({
                                        mode: 'open',
                                    });
                                    shadowRoot.innerHTML = content;
                                } else {
                                    console.log('epic - no shadow dom');
                                    container.innerHTML = content;
                                }

                                emitInsertEvent(
                                    test,
                                    products,
                                    variant.campaignCode
                                );

                                setupOnView(
                                    container,
                                    test,
                                    variant.campaignCode,
                                    trackingCampaignId,
                                    products
                                );
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        reportError(error, {}, false);
                    });
            },
        },
    ],
};

export const frontendDotcomRenderingEpic: EpicABTest = makeEpicABTest(
    frontendDotcomRenderingTest
);
