// @flow
import template from 'lodash/utilities/template';
import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { getSupporterPaymentRegion, getSync } from 'lib/geolocation';
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import iframeTemplate from 'raw-loader!common/views/acquisitions-epic-iframe.html';
import paypalPayInEpicControlTemplate from 'raw-loader!common/views/acquisitions-epic-paypal-pay-in-epic-control.html';

const createFormData = (region, amounts) => {
    const formDataByRegion = {
        GB: {
            amounts: amounts.GB,
            symbol: '£',
            countryGroup: 'uk',
        },
        EU: {
            amounts: amounts.EU,
            symbol: '€',
            countryGroup: 'eu',
        },
        US: {
            amounts: amounts.US,
            symbol: '$',
            countryGroup: 'us',
        },
        AU: {
            amounts: amounts.AU,
            symbol: '$',
            countryGroup: 'au',
        },
    };

    // INT and CA redirect to UK in contributions frontend.
    return formDataByRegion[region] || formDataByRegion.GB;
};

const pageContext = (campaignCode, amounts) => {
    const region = getSupporterPaymentRegion(getSync());

    return {
        intCmp: campaignCode,
        refererPageviewId: config.ophan.pageViewId,
        refererUrl: document.location.href,
        ophanBrowserId: config.ophan.browserId,
        formData: createFormData(region, amounts),
    };
};

const createVariant = (id, amounts) => ({
    id,

    products: ['ONE_OFF_CONTRIBUTION'],

    options: {
        isUnlimited: true,

        template(variant) {
            return template(iframeTemplate, {
                componentName: variant.options.componentName,
                id: variant.options.iframeId,
                iframeUrl:
                    'https://contribute.theguardian.com/components/epic/inline-payment',
            });
        },

        test(render, variant) {
            window.addEventListener('message', event => {
                if (event.data.type === 'PAGE_CONTEXT_REQUEST') {
                    const iframe = document.getElementById(
                        variant.options.iframeId
                    );

                    if (iframe instanceof HTMLIFrameElement) {
                        iframe.contentWindow.postMessage(
                            {
                                type: 'PAGE_CONTEXT',
                                pageContext: pageContext(
                                    variant.options.campaignCode,
                                    amounts
                                ),
                            },
                            '*'
                        );
                    }
                }
            });

            loadScript(
                'https://www.paypalobjects.com/api/checkout.js'
            ).then(() => render());
        },

        usesIframe: true,
    },
});

const createControl = () => ({
    id: 'control',

    products: ['ONE_OFF_CONTRIBUTION'],

    options: {
        isUnlimited: true,

        template(variant) {
            return template(paypalPayInEpicControlTemplate, {
                contributionUrl: `${variant.options
                    .contributeURL}&disableStripe=true`,
            });
        },
    },
});

export const payInEpic = makeABTest({
    id: 'AcquisitionsEpicPaypalPayInEpic',
    campaignId: 'epic_pay_in_epic',

    start: '2017-08-09',
    expiry: '2018-09-09',

    author: 'Guy Dawson & Sam Desborough',
    description:
        'Test whether letting readers pay in-Epic with Paypal will lead to a higher conversion rate',
    successMeasure: 'Conversion rate',
    idealOutcome: 'The pay in-Epic variant smashes the control out of the park',
    audienceCriteria: 'All',
    audience: 0.2,
    audienceOffset: 0.1,

    variants: [
        createControl(),

        createVariant('default_amounts', {
            GB: [25, 50, 100, 250],
            EU: [25, 50, 100, 250],
            US: [25, 50, 100, 250],
            AU: [50, 100, 250, 500],
        }),

        createVariant('low_amounts', {
            GB: [2, 5, 10, 25],
            EU: [2, 5, 10, 25],
            US: [2, 5, 10, 25],
            AU: [5, 10, 25, 50],
        }),
    ],
});
