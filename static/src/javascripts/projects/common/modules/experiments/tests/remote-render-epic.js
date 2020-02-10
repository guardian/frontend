// @flow

import { getSync as geolocationGetSync } from 'lib/geolocation';
import {
    makeEpicABTest,
    setupOnView,
    emitBeginEvent,
    setupClickHandling,
    emitInsertEvent,
} from 'common/modules/commercial/contributions-utilities';
import reportError from 'lib/report-error';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import fetch from 'lib/fetch';
import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';

const campaignId = 'remote_epic_test';
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

const fetchRemoteEpic = payload => {
    const api = 'https://contributions.guardianapis.com/epic';

    return fetch(api, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
    });
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

const remoteRenderTest = {
    id: 'RemoteRenderEpic',
    campaignId,

    highPriority: true,

    start: '2020-01-01',
    expiry: '2020-02-29',

    author: 'Nicolas Long',
    description:
        'A/B test local vs remote render of default epic, to validate Slot Machine approach and work to date',
    successMeasure: 'Conversion rate',
    idealOutcome: 'No difference between control and variant',

    audienceCriteria: 'All',
    audience: 0,
    audienceOffset: 0,

    geolocation,

    canRun: () => geolocation !== 'US',

    variants: [
        {
            id: 'control',
            buttonTemplate: epicButtonsTemplate,
            products,
        },
        {
            id: 'remote',
            products,
            // eslint-disable-next-line import/no-shadow
            test: (html: string, variant: EpicVariant, test: EpicABTest) => {
                const ophan = config.get('ophan');
                const page = config.get('page');

                const tracking = {
                    ophanPageId: ophan.pageViewId,
                    ophanComponentId: 'ACQUISITIONS_EPIC',
                    platformId: 'GUARDIAN_WEB',
                    campaignCode: variant.campaignCode, // "gdnwb_copts_memco_remote_epic_test_remote"
                    abTestName: test.id, // "RemoteRenderEpic"
                    abTestVariant: variant.id, // "remote"
                    referrerUrl:
                        window.location.origin + window.location.pathname,
                };

                const localisation = {
                    countryCode: geolocation,
                };

                const targeting = {
                    contentType: page.contentType,
                    sectionName: page.sectionName,
                    shouldHideReaderRevenue: page.shouldHideReaderRevenue,
                    isMinuteArticle: config.hasTone('Minute'),
                    isPaidContent: page.isPaidContent,
                    tags: buildKeywordTags(page),
                };

                const payload = JSON.stringify({
                    tracking,
                    localisation,
                    targeting,
                });

                const trackingCampaignId = `epic_${campaignId}`; // note exposed on ABTest unfortunately

                emitBeginEvent(trackingCampaignId);

                setupClickHandling(
                    test,
                    variant.campaignCode,
                    products,
                    variant.id
                );

                fetchRemoteEpic(payload)
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

export const remoteRenderEpic: EpicABTest = makeEpicABTest(remoteRenderTest);
