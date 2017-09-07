// @flow
import {
    makeABTest,
    defaultPageCheck as isEpicCompatibleWithPage,
} from 'common/modules/commercial/contributions-utilities';
import { setupEpicInLiveblog } from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import { viewsInPreviousDays } from 'common/modules/commercial/acquisitions-view-log';
import {
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import mediator from 'lib/mediator';
import fastdom from 'lib/fastdom-promise';

import config from 'lib/config';

const baseCampaignCode = 'gdnwb_copts_memco_sandc_us_rec_cont';

const getREFPVID = (): string =>
    (config.ophan && config.ophan.pageViewId) || 'not_found';

const buildURL = (url: string, campaignCode: string): string =>
    `${url}${url.indexOf('?') > 0
        ? '&'
        : '?'}INTCMP=${campaignCode}&REFPVID=${getREFPVID()}`;

const makeSupportURL = (
    campaignCode: string,
    context: boolean = false
): string =>
    buildURL(
        `https://support.theguardian.com/us/contribute${context
            ? '?context=true'
            : ''}`,
        campaignCode
    );

const makeBecomeSupporterURL = (campaignCode: string): string =>
    buildURL('https://membership.theguardian.com/us/supporter', campaignCode);

const makeContributionURL = (campaignCode: string): string =>
    buildURL('https://contribute.theguardian.com/us', campaignCode);

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

const isEpicWithinViewLimit = (): boolean => {
    const days = 30;
    const count = 4;
    const minDaysBetweenViews = 0;

    const withinViewLimit = viewsInPreviousDays(days, undefined) < count;
    const enoughDaysBetweenViews =
        viewsInPreviousDays(minDaysBetweenViews, undefined) === 0;
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
    becomeSupporterLinkDesktop: string,
    makeContributionLinkMobile: string
) => {
    changeLinks('js-change-become-member-link', makeContributionLinkMobile);
    changeLinks('js-become-member', becomeSupporterLinkDesktop);
};

const changeSideMenuLinks = (becomeSupporterLink: string) => {
    const cssClass = 'js-change-membership-item';
    fastdom.read(() => document.getElementsByClassName(cssClass)).then(els =>
        fastdom.write(() => {
            [...els].forEach(el => {
                if (el instanceof HTMLAnchorElement) {
                    if (
                        el.innerText &&
                        el.innerText.trim() === 'become a supporter'
                    ) {
                        el.href = becomeSupporterLink;
                    }
                }
            });
        })
    );
};

const shouldDisplayEpic = (): boolean =>
    isEpicWithinViewLimit() && isEpicCompatibleWithPage(config.get('page'));

const bindEpicInsertAndViewHandlers = (
    test: EpicABTest,
    products: $ReadOnlyArray<OphanProduct>,
    campaignCode: string
) => {
    // These should get fired when the epic is inserted & viewed
    mediator.once(test.insertEvent, () => {
        submitInsertEvent(test.componentType, products, campaignCode);
    });

    mediator.once(test.viewEvent, () => {
        submitViewEvent(test.componentType, products, campaignCode);
    });
};

export const acquisitionsSupportUsRecurringContribution = makeABTest({
    id: 'AcquisitionsSupportUsRecurringContribution',
    campaignId: 'sandc_support_us_rec_cont',

    start: '2017-08-31',
    expiry: '2017-10-19',

    author: 'justinpinner',
    description:
        'Test demand for recurring contributions in the US across all channels',
    successMeasure: 'Annualised value',
    idealOutcome:
        'The new proposition delivers the same or greater annualised value',

    audienceCriteria: 'US all devices',
    audience: 1,
    audienceOffset: 0,
    locations: ['US'],

    campaignSuffix: 'epic',

    // (epic & banner will not display.
    pageCheck: () => true,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                // These should get fired after the test runs, regardless of
                // whether we display the epic, banner, or just header
                impression: submitABTestImpression => submitABTestImpression(),
                success: submitABTestComplete => submitABTestComplete(),

                isOutbrainCompliant:
                    config.get('page.contentType') === 'LiveBlog' ||
                    !shouldDisplayEpic(),

                useTailoredCopyForRegulars: true,
                test(renderArticleEpic, variant, test) {
                    bindEpicInsertAndViewHandlers(
                        test,
                        variant.options.products,
                        variant.options.campaignCode
                    );

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
                    } else if (shouldDisplayEpic()) {
                        renderArticleEpic();
                    }

                    changeHeaderLinks(
                        makeBecomeSupporterURL(
                            `${baseCampaignCode}_control_header_become_supporter`
                        ),
                        makeContributionURL(
                            `${baseCampaignCode}_control_header_make_contribution`
                        )
                    );

                    changeSideMenuLinks(
                        makeBecomeSupporterURL(
                            `${baseCampaignCode}_control_side_menu_become_supporter`
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
            products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],

            // EPIC
            options: {
                impression: submitABTestImpression => submitABTestImpression(),
                success: submitABTestComplete => submitABTestComplete(),

                isOutbrainCompliant:
                    config.get('page.contentType') === 'LiveBlog' ||
                    !shouldDisplayEpic(),

                buttonTemplate: buildButtonTemplate,
                supportCustomURL:
                    'https://support.theguardian.com/us/contribute',
                useTailoredCopyForRegulars: true,

                test(renderArticleEpic, variant, test) {
                    bindEpicInsertAndViewHandlers(
                        test,
                        variant.options.products,
                        variant.options.campaignCode
                    );

                    if (config.get('page.contentType') === 'LiveBlog') {
                        const url = makeSupportURL(
                            `${baseCampaignCode}_support_liveblog`
                        );

                        const ctaSentence = `You can give to the Guardian by <a href="${url}" target="_blank" class="u-underline">becoming a supporter</a>`;
                        const epicHtml = liveblogEpicTemplate(ctaSentence);

                        setupEpicInLiveblog(epicHtml, test);
                    } else if (shouldDisplayEpic()) {
                        renderArticleEpic();
                    }

                    changeHeaderLinks(
                        makeSupportURL(
                            `${baseCampaignCode}_support_header_become_supporter`,
                            true
                        ),
                        makeSupportURL(
                            `${baseCampaignCode}_support_header_make_contribution`,
                            true
                        )
                    );

                    changeSideMenuLinks(
                        makeSupportURL(
                            `${baseCampaignCode}_support_side_menu_become_supporter`,
                            true
                        )
                    );
                },

                // ENGAGEMENT BANNER
                engagementBannerParams: {
                    buttonCaption: 'Support the Guardian',
                    campaignCode: `${baseCampaignCode}_support_banner`,
                    linkUrl: `https://support.theguardian.com/us/contribute?context=true`,
                },

                isUnlimited: true,
            },
        },
    ],
});
