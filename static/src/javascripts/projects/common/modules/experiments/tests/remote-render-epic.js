// @flow

import { makeEpicABTest } from 'common/modules/commercial/contributions-utilities';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import fetch from 'lib/fetch';
import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';

const campaignId = 'gdnwb_copts_memco_remote_epic_test_api';

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

const test = {
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
    audience: 1,
    audienceOffset: 0,

    geolocation: undefined,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            buttonTemplate: epicButtonsTemplate,
        },
        {
            id: 'remote',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            test: () => {
                const ophan = config.get('ophan');
                const page = config.get('page');

                const tracking = {
                    ophanPageId: ophan.pageViewId,
                    ophanComponentId: 'ACQUISITIONS_EPIC',
                    platformId: 'GUARDIAN_WEB',
                    campaignCode: campaignId,
                    abTestName: 'remote_epic_test',
                    abTestVariant: 'api',
                    referrerUrl:
                        window.location.origin + window.location.pathname,
                };

                const localisation = {
                    countryCode: 'US',
                };

                const targeting = {
                    contentType: page.contentType,
                    sectionName: page.sectionName,
                    shouldHideReaderRevenue: page.shouldHideReaderRevenue,
                    isMinuteArticle: page.isLiveBlog, // Is this the same thing?
                    isPaidContent: page.isPaidContent,
                    tags: buildKeywordTags(page),
                };

                const payload = JSON.stringify({
                    tracking,
                    localisation,
                    targeting,
                });

                fetchRemoteEpic(payload)
                    .then(checkResponseOk)
                    .then(decodeJson)
                    .then(json => {
                        const html = json.html;
                        const css = json.css;
                        const content = `<style>${css}</style>${html}`;

                        return fastdom.write(() => {
                            const target = document.querySelector('.submeta');

                            if (!target) {
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
                                console.log('has shadow dom...');
                                const shadowRoot = container.attachShadow({
                                    mode: 'open',
                                });
                                shadowRoot.innerHTML = content;
                            } else {
                                console.log('no shadow dom...');
                                container.innerHTML = content;
                            }
                        });
                    })
                    .catch(error =>
                        console.log(
                            `An error occurred while fetching epic: ${error}`
                        )
                    );
            },
        },
    ],
};

export const remoteRenderEpic: EpicABTest = makeEpicABTest(test);
