// @flow
import {
    makeABTest,
    defaultPageCheck as isEpicCompatibleWithPage,
} from 'common/modules/commercial/contributions-utilities';
import { setupEpicInLiveblog } from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import { viewsInPreviousDays } from 'common/modules/commercial/acquisitions-view-log';

import config from 'lib/config';

const baseCampaignCode = 'gdnwb_copts_memco_sandc_support_baseline';

const makeSupportURL = (campaignCode: string): string =>
    `https://support.theguardian.com/uk?INTCMP=${campaignCode}`;

const makeBecomeSupporterURL = (campaignCode: string): string =>
    `https://membership.theguardian.com/uk/supporter?INTCMP=${campaignCode}`;

const makeSubscribeURL = (campaignCode: string): string =>
    `https://subscribe.theguardian.com/uk?INTCMP=${campaignCode}`;


const buildButtonTemplate = ({ supportUrl }) =>
    `<div class="contributions__amount-field">
        <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-single-button"
               href="${supportUrl}"
               target="_blank">
                Support the Guardian
            </a>
        </div>
    </div>`;

const liveblogEpicTemplate = (ctaSentence: string) =>
    `<div class="block block--content is-epic">
        <p class="block-time published-time">
            <a href="#" itemprop="url" class="block-time__link">
                <time data-relativeformat="med" itemprop="datePublished" class="js-timestamp"></time>
                <span class="block-time__absolute"></span>
            </a>
        </p>
        <div class="block-elements block-elements--no-byline">
            <p>
                <em>
                    Since you’re here &hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And <span class="contributions__highlight">unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.
                </em>
            </p>
            <p>
                <em>
                    If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.
                    ${ctaSentence}. - Guardian HQ
                </em>
            </p>
        </div>
    </div>`;

const isEpicWithinViewLimit = (test: EpicABTest): boolean => {
    const days = 30;
    const count = 4;
    const minDaysBetweenViews = 0;

    const testId = test.useLocalViewLog ? test.id : undefined;

    const withinViewLimit = viewsInPreviousDays(days, testId) < count;
    const enoughDaysBetweenViews =
        viewsInPreviousDays(minDaysBetweenViews, testId) === 0;
    return withinViewLimit && enoughDaysBetweenViews;
};

const changeLinks = (cssClass: string, link: string) => {
    [...document.getElementsByClassName(cssClass)].forEach(el => {
        if (el instanceof HTMLAnchorElement) {
            el.href = link;
        }
    });
};

const changeHeaderLinks = (
    becomeSupporterLink: string,
    subscribeLink: string
) => {
    changeLinks('js-become-member', becomeSupporterLink);
    changeLinks('js-subscribe', subscribeLink);

    changeLinks('js-become-member-new-header', becomeSupporterLink);
    changeLinks('js-subscribe-new-header', subscribeLink);
};


const shouldDisplayEpic = (test: EpicABTest): boolean =>
    isEpicWithinViewLimit(test) && isEpicCompatibleWithPage(config.get('page'));

// gdnwb_copts_memco_sandc_support_baseline_support_epic

export const acquisitionsSupportBaseline = makeABTest({
    id: 'AcquisitionsSupportBaseline',
    campaignId: 'sandc_support_baseline',

    start: '2017-08-21',
    expiry: '2017-10-13',

    author: 'svillafe',
    description: 'Test new S&C proposition against current membership',
    successMeasure: 'Annualised value',
    idealOutcome:
        'The new proposition delivers the same or greater annualised value',

    audienceCriteria: 'UK all devices',
    audience: 1,
    audienceOffset: 0,
    locations: ['GB'],

    campaignSuffix: 'epic',

    // (epic & banner will not display.
    pageCheck: () => true,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                useTailoredCopyForRegulars: true,
                test(renderArticleEpic, variant, test) {
                    if (config.get('page.contentType') === 'LiveBlog') {
                        const membershipURL = variant.membershipURLBuilder(
                            campaignCode => `${campaignCode}_liveblog`
                        );
                        const contributionsURL = variant.contributionsURLBuilder(
                            campaignCode => `${campaignCode}_liveblog`
                        );
                        const ctaSentence = `You can give to the Guardian by <a href="${membershipURL}" target="_blank" class="u-underline">becoming a monthly supporter</a> or by making a <a href="${contributionsURL}" target="_blank" class="u-underline">one-off contribution</a>`;
                        const epicHtml = liveblogEpicTemplate(ctaSentence);

                        setupEpicInLiveblog(epicHtml, test);
                    } else if (shouldDisplayEpic(test)) {
                        renderArticleEpic();
                    }

                    changeHeaderLinks(
                        makeBecomeSupporterURL(
                            `${baseCampaignCode}_control_header_become_supporter`
                        ),
                        makeSubscribeURL(
                            `${baseCampaignCode}_control_header_subscribe`
                        )
                    );
                },

                engagementBannerParams: {
                    campaignCode: `${baseCampaignCode}_control_banner`,
                },

                isUnlimited: true,
            },
        },
        {
            id: 'support',
            products: [
                'CONTRIBUTION',
                'RECURRING_CONTRIBUTION',
                'DIGITAL_SUBSCRIPTION',
                'PAPER_SUBSCRIPTION_EVERYDAY',
                'PAPER_SUBSCRIPTION_SIXDAY',
                'PAPER_SUBSCRIPTION_WEEKEND',
                'PAPER_SUBSCRIPTION_SUNDAY',
            ],

            // EPIC
            options: {
                buttonTemplate: buildButtonTemplate,
                supportCustomURL: 'https://support.theguardian.com/uk',
                useTailoredCopyForRegulars: true,

                test(renderArticleEpic, variant, test) {
                    if (config.get('page.contentType') === 'LiveBlog') {
                        const url = makeSupportURL(
                            `${baseCampaignCode}_support_liveblog`
                        );

                        const ctaSentence = `You can give to the Guardian by <a href="${url}" target="_blank" class="u-underline">becoming a supporter</a>`;
                        const epicHtml = liveblogEpicTemplate(ctaSentence);

                        setupEpicInLiveblog(epicHtml, test);
                    } else if (shouldDisplayEpic(test)) {
                        renderArticleEpic();
                    }

                    changeHeaderLinks(
                        makeSupportURL(
                            `${baseCampaignCode}_support_header_become_supporter`
                        ),
                        makeSupportURL(
                            `${baseCampaignCode}_support_header_subscribe`
                        )
                    );
                },

                // ENGAGEMENT BANNER
                engagementBannerParams: {
                    buttonCaption: 'Support the Guardian',
                    campaignCode: `${baseCampaignCode}_support_banner`,
                    linkUrl: `https://support.theguardian.com/uk`,
                },

                isUnlimited: true,
            },
        },
    ],
});
