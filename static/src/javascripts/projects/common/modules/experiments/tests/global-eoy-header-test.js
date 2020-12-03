// @flow
import config from "lib/config";
import {
    addTrackingCodesToUrl,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import {addCountryGroupToSupportLink} from "common/modules/commercial/support-utilities";

const edition = config.get('page.edition', '').toLowerCase();

const componentType = 'ACQUISITIONS_HEADER';
const componentId = 'header_support';
const campaignCode = 'header_support';
const testName = 'GlobalEoyHeaderTest';

type VariantName = 'variant' | 'control';

const onView = (variant: VariantName): void => submitViewEvent({
    component: {
        componentType,
        products: [],
        campaignCode,
        id: componentId,
    },
    abTest: {
        name: testName,
        variant,
    }
});

const buildUrl = (rrType: 'contribute' | 'subscribe', variant: VariantName): string => addTrackingCodesToUrl({
    base: addCountryGroupToSupportLink(`https://support.theguardian.com/${rrType}`),
    componentType,
    componentId,
    campaignCode,
    abTest: {
        name: testName,
        variant,
    },
});

const buildHtml = (heading: string, subheading: string, variant: VariantName): string => `
    <div class="cta-bar__text hide-until-tablet">
        <div class="cta-bar__heading">${heading}</div>
        <div class="cta-bar__subheading">${subheading}</div>
    </div>
                    
    <a class="cta-bar__cta hide-until-tablet js-change-become-member-link js-acquisition-link" data-link-name="nav2 : contribute-cta" data-edition="${edition}" href="${buildUrl('contribute', variant)}">
        Contribute
        <span class="inline-arrow-right inline-icon ">
            <svg width="30" height="30" viewBox="0 0 30 30" class="inline-arrow-right__svg inline-icon__svg">
                <path d="M22.8 14.6L15.2 7l-.7.7 5.5 6.6H6v1.5h14l-5.5 6.6.7.7 7.6-7.6v-.9"></path>
            </svg>
        </span>
    </a>

    <a class="cta-bar__cta hide-until-tablet js-subscribe js-acquisition-link" data-link-name="nav2 : subscribe-cta" data-edition="${edition}" href="${buildUrl('subscribe', variant)}">
        Subscribe
        <span class="inline-arrow-right inline-icon ">
            <svg width="30" height="30" viewBox="0 0 30 30" class="inline-arrow-right__svg inline-icon__svg">
                <path d="M22.8 14.6L15.2 7l-.7.7 5.5 6.6H6v1.5h14l-5.5 6.6.7.7 7.6-7.6v-.9"></path>
            </svg>
        </span>
    </a>

    ${edition === 'uk' ?
        `<a class="cta-bar__cta hide-from-tablet js-change-become-member-link js-acquisition-link" data-link-name="nav2 : support-cta" data-edition="${edition}" href="${buildUrl('subscribe', variant)}">
            Subscribe
            <span class="inline-arrow-right inline-icon ">
                <svg width="30" height="30" viewBox="0 0 30 30" class="inline-arrow-right__svg inline-icon__svg">
                    <path d="M22.8 14.6L15.2 7l-.7.7 5.5 6.6H6v1.5h14l-5.5 6.6.7.7 7.6-7.6v-.9"></path>
                </svg>
            </span>
        </a>` :
        `<a class="cta-bar__cta hide-from-tablet js-change-become-member-link js-acquisition-link"
           data-link-name="nav2 : contribute-cta" data-edition="${edition}"
           href="${buildUrl('contribute', variant)}">
            Contribute
            <span class="inline-arrow-right inline-icon ">
                <svg width="30" height="30" viewBox="0 0 30 30" class="inline-arrow-right__svg inline-icon__svg">
                    <path d="M22.8 14.6L15.2 7l-.7.7 5.5 6.6H6v1.5h14l-5.5 6.6.7.7 7.6-7.6v-.9"></path>
                </svg>
            </span>
        </a>`
    }
`;

const controlHtml = (): string => buildHtml('Support The Guardian', 'Available for everyone, funded by readers', 'control');
const variantHtml = (): string => buildHtml('Support us this December', 'Power vital, open, independent journalism', 'variant');

const getHeaderCtaBar = () => window.document.querySelector('.new-header__cta-bar');

export const globalEoyHeaderTest: ABTest = {
    id: testName,
    start: '2020-12-02',
    expiry: '2021-01-02',
    author: 'Tom Forbes',
    description: 'Test reader revenue message in header',
    audience: 1.0,
    audienceOffset: 0,
    successMeasure: 'AV',
    idealOutcome: 'AV',
    showForSensitive: false,
    audienceCriteria: 'All',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {
                const bar = getHeaderCtaBar();
                if (bar) {
                    bar.innerHTML = controlHtml();
                    onView('control')
                }
            },
        },
        {
            id: 'variant',
            test: (): void => {
                const bar = getHeaderCtaBar();
                if (bar) {
                    bar.innerHTML = variantHtml();
                    onView('variant')
                }
            },
        },
    ],
};
