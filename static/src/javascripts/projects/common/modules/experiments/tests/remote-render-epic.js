// @flow
import { makeEpicABTest } from 'common/modules/commercial/contributions-utilities';
import fetch from 'lib/fetch';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';


const test = {
    initVariant: {
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

        variants: [
            {
                id: 'control',
                products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
                buttonTemplate: epicButtonsTemplate,
            },
            {
                id: 'remote',
                products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
                test: async () => {
                    const api = 'https://contributions.guardianapis.com/epic';
                    const response = await fetch(api, {})
                    if (response.ok) {
                        const json = await response.json();
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
                    }
                }
            },
        ],
    },
}


export const remoteRenderEpic: EpicABTest = makeEpicABTest(test);
