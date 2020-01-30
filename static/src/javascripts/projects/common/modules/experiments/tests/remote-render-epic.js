// @flow
import { makeEpicABTest } from 'common/modules/commercial/contributions-utilities';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons'
import fetch from 'lib/fetch';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';


const test = {
    id: 'RemoteRenderEpic',
    campaignId: 'gdnwb_copts_memco_remote_epic_test_api',

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

                const tracking = {
                    ophanPageId: 'k5nxn0mxg7ytwpkxuwms',
                    ophanComponentId: 'ACQUISITIONS_EPIC',
                    platformId: 'GUARDIAN_WEB',
                    campaignCode: 'gdnwb_copts_memco_remote_epic_test_api',
                    abTestName: 'remote_epic_test',
                    abTestVariant: 'api',
                    referrerUrl:
                        'http://localhost:3000/politics/2020/jan/17/uk-rules-out-automatic-deportation-of-eu-citizens-verhofstadt-brexit',
                };

                const localisation = {
                    countryCode: 'US',
                };

                const targeting = {
                    contentType: 'Article',
                    sectionName: 'culture',
                    shouldHideReaderRevenue: false,
                    isMinuteArticle: false,
                    isPaidContent: false,
                    tags: [
                        {
                            id: 'culture/david-schwimmer',
                            type: 'Keyword',
                            title: 'David Schwimmer',
                        },
                        {
                            id: 'tv-and-radio/friends',
                            type: 'Keyword',
                            title: 'Friends',
                        },
                        {
                            id: 'tone/interview',
                            type: 'Tone',
                            title: 'Interviews',
                        },
                        {
                            id: 'publication/theguardian',
                            type: 'Publication',
                            title: 'The Guardian',
                        },
                        {
                            id: 'profile/davidsmith',
                            type: 'Contributor',
                            title: 'David Smith',
                            twitterHandle: 'smithinamerica',
                            bylineImageUrl:
                                'https://i.guim.co.uk/img/uploads/2017/10/06/David-Smith,-L.png?width=300&quality=85&auto=format&fit=max&s=9aebe85c96f6f72a6ba6239cdfaed7ec',
                        },
                    ],
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
