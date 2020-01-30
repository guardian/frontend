// @flow
import { makeEpicABTest } from 'common/modules/commercial/contributions-utilities';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons'
import fetch from 'lib/fetch';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';

const campaignId = 'gdnwb_copts_memco_remote_epic_test_api';

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
                const api = 'https://contributions.guardianapis.com/epic';

                const { ophan, page } = window.guardian.config;

                const tracking = {
                    ophanPageId: ophan.pageViewId,
                    ophanComponentId: 'ACQUISITIONS_EPIC',
                    platformId: 'GUARDIAN_WEB',
                    campaignCode: campaignId,
                    abTestName: 'remote_epic_test',
                    abTestVariant: 'api',
                    referrerUrl: window.location.origin + window.location.pathname,
                };

                const localisation = {
                    countryCode: 'US',
                };

                const keywordIds = page.keywordIds.split(',');
                const keywords = page.keywords.split(',');
                const keywordTags = keywordIds.map((id, idx) => ({
                   id,
                   type: 'Keyword',
                   title: keywords[idx],
                }));

                const targeting = {
                    contentType: page.contentType,
                    sectionName: page.sectionName,
                    shouldHideReaderRevenue: page.shouldHideReaderRevenue,
                    isMinuteArticle: page.isLiveBlog, // Is this the same thing?
                    isPaidContent: page.isPaidContent,
                    tags: keywordTags,
                };

                fetch(api, {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tracking, localisation, targeting })
                }).then(response => {
                    if (response.ok) {
                        response.json().then(json => {
                            const html = json.html;
                            const css = json.css;
                            const markup = `<style>${css}</style>${html}`;
                            const component = $.create(markup);

                            return fastdom.write(() => {
                                const target = document.querySelector('.submeta')

                                if (!target) {
                                    return;
                                }

                                component.insertBefore(target);
                            });
                        });
                    }
                });
            }
        },
    ],
}


export const remoteRenderEpic: EpicABTest = makeEpicABTest(test);
