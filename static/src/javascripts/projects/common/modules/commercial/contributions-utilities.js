// @flow
import { isAbTestTargeted } from 'common/modules/commercial/targeting-tool';
import {
    logView,
    viewsInPreviousDays,
} from 'common/modules/commercial/acquisitions-view-log';
import {
    addTrackingCodesToUrl,
    submitClickEvent,
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import $ from 'lib/$';
import config from 'lib/config';
import { elementInView } from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';
import mediator from 'lib/mediator';
import {
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { splitAndTrim, optionalSplitAndTrim } from 'lib/string-utils';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import { userIsSupporter } from 'common/modules/commercial/user-features';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { awaitEpicButtonClicked } from 'common/modules/commercial/epic/epic-utils';
import { setupEpicInLiveblog } from 'common/modules/commercial/contributions-liveblog-utilities';
import {
    bannerMultipleTestsGoogleDocUrl,
    epicMultipleTestsGoogleDocUrl,
    getGoogleDoc,
} from 'common/modules/commercial/contributions-google-docs';
import {
    defaultExclusionRules,
    isArticleWorthAnEpicImpression,
} from 'common/modules/commercial/epic/epic-exclusion-rules';
import { getControlEpicCopy } from 'common/modules/commercial/acquisitions-copy';

export type ReaderRevenueRegion =
    | 'united-kingdom'
    | 'united-states'
    | 'australia'
    | 'rest-of-world';

const getReaderRevenueRegion = (geolocation: string): ReaderRevenueRegion => {
    switch (geolocation) {
        case 'GB':
            return 'united-kingdom';
        case 'US':
            return 'united-states';
        case 'AU':
            return 'australia';
        default:
            return 'rest-of-world';
    }
};

// How many times the user can see the Epic,
// e.g. 6 times within 7 days with minimum of 1 day in between views.
const defaultMaxViews: MaxViews = {
    days: 30,
    count: 4,
    minDaysBetweenViews: 0,
};

const defaultButtonTemplate: CtaUrls => string = (url: CtaUrls) =>
    epicButtonsTemplate(url);

const controlTemplate: EpicTemplate = (
    variant: EpicVariant,
    copy: AcquisitionsEpicTemplateCopy
) =>
    acquisitionsEpicControlTemplate({
        copy,
        componentName: variant.componentName,
        buttonTemplate: variant.buttonTemplate
            ? variant.buttonTemplate({
                  supportUrl: variant.supportURL,
                  subscribeUrl: variant.subscribeURL,
              })
            : undefined,
    });

const liveBlogTemplate: EpicTemplate = (
    variant: EpicVariant,
    copy: AcquisitionsEpicTemplateCopy
) =>
    epicLiveBlogTemplate({
        copy,
        componentName: variant.componentName,
        supportURL: variant.supportURL,
    });

const doTagsMatch = (test: EpicABTest): boolean =>
    test.useTargetingTool ? isAbTestTargeted(test) : true;

// Returns an array containing:
// - the first element matching insertAtSelector
// - or an empty array if the selector doesn't match anything on the page
const getTargets = (insertAtSelector: string): Array<HTMLElement> => {
    const els = Array.from(document.querySelectorAll(insertAtSelector));

    if (els.length) {
        return [els[0]];
    }

    return [];
};

const isCompatibleWithArticleEpic = (page: Object): boolean =>
    page.contentType === 'Article' &&
    !page.isMinuteArticle &&
    isArticleWorthAnEpicImpression(page, defaultExclusionRules);

const isCompatibleWithLiveBlogEpic = (page: Object): boolean =>
    page.contentType === 'LiveBlog' &&
    isArticleWorthAnEpicImpression(page, defaultExclusionRules);

const pageShouldHideReaderRevenue = () =>
    config.get('page.shouldHideReaderRevenue');

const shouldShowEpic = (test: EpicABTest): boolean => {
    const onCompatiblePage = test.pageCheck(config.get('page'));

    const tagsMatch = doTagsMatch(test);

    const isCompatibleUser = test.onlyShowToExistingSupporters
        ? userIsSupporter()
        : !userIsSupporter();

    return (
        !pageShouldHideReaderRevenue() &&
        onCompatiblePage &&
        isCompatibleUser &&
        tagsMatch
    );
};

const createTestAndVariantId = (campaignCodePrefix, campaignID, id) =>
    `${campaignCodePrefix}_${campaignID}_${id}`;

const makeEvent = (id: string, event: string): string => `${id}:${event}`;

const pageMatchesTags = (tagIds: string[]): boolean =>
    tagIds.some(tagId =>
        `${config.get('page.keywordIds')},${config.get(
            'page.nonKeywordTagIds'
        )}`.includes(tagId)
    );

const pageMatchesSections = (sectionIds: string[]): boolean =>
    sectionIds.some(section => config.get('page.section') === section);

const makeEpicABTestVariant = (
    initVariant: InitEpicABTestVariant,
    template: EpicTemplate,
    parentTest: EpicABTest
): EpicVariant => {
    const trackingCampaignId = `epic_${parentTest.campaignId}`;
    const componentId = createTestAndVariantId(
        parentTest.campaignPrefix,
        parentTest.campaignId,
        initVariant.id
    );
    const campaignCode = createTestAndVariantId(
        parentTest.campaignPrefix,
        parentTest.campaignId,
        initVariant.id
    );
    const deploymentRules = initVariant.deploymentRules || defaultMaxViews;

    return {
        id: initVariant.id,
        componentName: `mem_acquisition_${trackingCampaignId}_${
            initVariant.id
        }`,
        campaignCode,
        supportURL: addTrackingCodesToUrl({
            base: supportContributeURL,
            componentType: parentTest.componentType,
            componentId,
            campaignCode,
            abTest: {
                name: parentTest.id,
                variant: initVariant.id,
            },
        }),
        subscribeURL: addTrackingCodesToUrl({
            base: 'https://support.theguardian.com/subscribe',
            componentType: parentTest.componentType,
            componentId,
            campaignCode,
            abTest: {
                name: parentTest.id,
                variant: initVariant.id,
            },
        }),
        template,
        buttonTemplate: initVariant.buttonTemplate,
        copy: initVariant.copy,

        locations: initVariant.locations || [],
        tagIds: initVariant.tagIds || [],
        sections: initVariant.sections || [],
        excludedTagIds: initVariant.excludedTagIds || [],
        excludedSections: initVariant.excludedSections || [],

        canRun() {
            const checkMaxViews = (maxViews: MaxViews) => {
                const {
                    count: maxViewCount,
                    days: maxViewDays,
                    minDaysBetweenViews: minViewDays,
                } = maxViews;

                const testId = parentTest.useLocalViewLog
                    ? parentTest.id
                    : undefined;

                const withinViewLimit =
                    viewsInPreviousDays(maxViewDays, testId) < maxViewCount;
                const enoughDaysBetweenViews =
                    viewsInPreviousDays(minViewDays, testId) === 0;

                return withinViewLimit && enoughDaysBetweenViews;
            };

            const meetsMaxViewsConditions =
                deploymentRules === 'AlwaysAsk' ||
                checkMaxViews(deploymentRules);

            const matchesLocations =
                this.locations.length === 0 ||
                this.locations.some(
                    region => geolocationGetSync() === region.toUpperCase()
                );

            const matchesTags =
                this.tagIds.length === 0 || pageMatchesTags(this.tagIds);
            const matchesSections =
                this.sections.length === 0 ||
                pageMatchesSections(this.sections);
            const noExcludedTags = !pageMatchesTags(this.excludedTagIds);
            const notExcludedSection = !pageMatchesSections(
                this.excludedSections
            );

            return (
                meetsMaxViewsConditions &&
                matchesLocations &&
                matchesTags &&
                matchesSections &&
                noExcludedTags &&
                notExcludedSection
            );
        },

        test() {
            const copyPromise: Promise<AcquisitionsEpicTemplateCopy> =
                (this.copy && Promise.resolve(this.copy)) ||
                getControlEpicCopy();

            copyPromise
                .then((copy: AcquisitionsEpicTemplateCopy) =>
                    this.template(this, copy)
                )
                .then(renderedTemplate => {
                    if (initVariant.test) {
                        initVariant.test(renderedTemplate, this);
                    } else {
                        // Standard epic insertion. TODO - this could do with a refactor
                        const component = $.create(renderedTemplate);

                        mediator.emit('register:begin', trackingCampaignId);

                        return fastdom.write(() => {
                            const targets = getTargets('.submeta');

                            awaitEpicButtonClicked().then(() =>
                                submitClickEvent({
                                    component: {
                                        componentType: parentTest.componentType,
                                        products: initVariant.products,
                                        campaignCode,
                                        id: campaignCode,
                                    },
                                    abTest: {
                                        name: parentTest.id,
                                        variant: initVariant.id,
                                    },
                                })
                            );

                            if (targets.length > 0) {
                                component.insertBefore(targets);

                                mediator.emit(parentTest.insertEvent, {
                                    componentType: parentTest.componentType,
                                    products: initVariant.products,
                                    campaignCode,
                                });

                                component.each(element => {
                                    // top offset of 18 ensures view only counts when half of element is on screen
                                    const inView = elementInView(
                                        element,
                                        window,
                                        {
                                            top: 18,
                                        }
                                    );

                                    inView.on('firstview', () => {
                                        logView(parentTest.id);
                                        mediator.emit(parentTest.viewEvent, {
                                            componentType:
                                                parentTest.componentType,
                                            products: initVariant.products,
                                            campaignCode,
                                        });
                                        mediator.emit(
                                            'register:end',
                                            trackingCampaignId
                                        );
                                    });
                                });
                            }

                            return component[0];
                        });
                    }
                });
        },
        impression: submitABTestImpression =>
            mediator.once(parentTest.insertEvent, () => {
                submitInsertEvent({
                    component: {
                        componentType: parentTest.componentType,
                        products: initVariant.products,
                        campaignCode,
                        id: campaignCode,
                    },
                    abTest: {
                        name: parentTest.id,
                        variant: initVariant.id,
                    },
                });

                submitABTestImpression();
            }),
        success: submitABTestComplete =>
            mediator.once(parentTest.viewEvent, () => {
                submitViewEvent({
                    component: {
                        componentType: parentTest.componentType,
                        products: initVariant.products,
                        campaignCode,
                        id: campaignCode,
                    },
                    abTest: {
                        name: parentTest.id,
                        variant: initVariant.id,
                    },
                });
                submitABTestComplete();
            }),
    };
};

const makeEpicABTest = ({
    id,
    start,
    expiry,
    author,
    idealOutcome,
    campaignId,
    description,
    audience,
    audienceOffset,
    successMeasure,
    audienceCriteria,
    variants,

    // optional params
    campaignPrefix = 'gdnwb_copts_memco',
    useLocalViewLog = false,
    useTargetingTool = false,
    onlyShowToExistingSupporters = false,
    pageCheck = isCompatibleWithArticleEpic,
    template = controlTemplate,
}: InitEpicABTest): EpicABTest => {
    const test = {
        // this is true because we use the reader revenue flag rather than sensitive
        // to disable contributions asks for a particular piece of content
        showForSensitive: true,
        canRun() {
            return shouldShowEpic(this);
        },
        componentType: 'ACQUISITIONS_EPIC',
        insertEvent: makeEvent(id, 'insert'),
        viewEvent: makeEvent(id, 'view'),

        variants: [],

        id,
        start,
        expiry,
        author,
        description,
        audience,
        audienceOffset,
        successMeasure,
        audienceCriteria,
        idealOutcome,
        campaignId,
        campaignPrefix,
        useLocalViewLog,
        onlyShowToExistingSupporters,
        pageCheck,
        useTargetingTool,
    };

    test.variants = variants.map(variant =>
        makeEpicABTestVariant(variant, template, test)
    );

    return test;
};

export const getEpicTestsFromGoogleDoc = (): Promise<
    $ReadOnlyArray<EpicABTest>
> =>
    getGoogleDoc(epicMultipleTestsGoogleDocUrl)
        .then(googleDocJson => {
            const sheets = googleDocJson && googleDocJson.sheets;

            if (!sheets) {
                return [];
            }

            return Object.keys(sheets)
                .filter(testName => testName.endsWith('__ON'))
                .map(name => {
                    const isThankYou = name.includes('__thank_you');
                    const isLiveBlog = name.includes('__liveblog');

                    const rows = sheets[name];
                    const testName = name.split('__ON')[0];
                    return makeEpicABTest({
                        id: testName,
                        campaignId: testName,

                        start: '2018-01-01',
                        expiry: '2020-01-01',

                        author: 'Google Docs',
                        description: 'Google Docs',
                        successMeasure: 'AV2.0',
                        idealOutcome: 'Google Docs',
                        audienceCriteria: 'All',
                        audience: 1,
                        audienceOffset: 0,

                        ...(isLiveBlog
                            ? {
                                  template: liveBlogTemplate,
                                  pageCheck: isCompatibleWithLiveBlogEpic,
                              }
                            : {
                                  template: controlTemplate,
                                  pageCheck: isCompatibleWithArticleEpic,
                              }),
                        ...(isThankYou
                            ? {
                                  onlyShowToExistingSupporters: true,
                                  useLocalViewLog: true,
                              }
                            : {}),
                        variants: rows.map(row => ({
                            id: row.name.toLowerCase().trim(),
                            ...(isLiveBlog
                                ? { test: setupEpicInLiveblog }
                                : {}),
                            deploymentRules:
                                row.alwaysAsk &&
                                row.alwaysAsk.toLowerCase() === 'true'
                                    ? 'AlwaysAsk'
                                    : ({
                                          days:
                                              parseInt(row.maxViewsDays, 10) ||
                                              defaultMaxViews.days,
                                          count:
                                              parseInt(row.maxViewsCount, 10) ||
                                              defaultMaxViews.count,
                                          minDaysBetweenViews:
                                              parseInt(
                                                  row.minDaysBetweenViews,
                                                  10
                                              ) ||
                                              defaultMaxViews.minDaysBetweenViews,
                                      }: MaxViews),

                            buttonTemplate: isThankYou
                                ? undefined
                                : defaultButtonTemplate,
                            locations: optionalSplitAndTrim(row.locations, ','),
                            tagIds: optionalSplitAndTrim(row.tagIds, ','),
                            sections: optionalSplitAndTrim(row.sections, ','),
                            excludedTagIds: optionalSplitAndTrim(
                                row.excludedTagIds,
                                ','
                            ),
                            excludedSections: optionalSplitAndTrim(
                                row.excludedSections,
                                ','
                            ),
                            copy: {
                                heading: row.heading,
                                paragraphs: splitAndTrim(row.paragraphs, '\n'),
                                highlightedText: row.highlightedText
                                    ? row.highlightedText.replace(
                                          /%%CURRENCY_SYMBOL%%/g,
                                          getLocalCurrencySymbol()
                                      )
                                    : undefined,
                            },
                        })),
                    });
                });
        })
        .catch((err: Error) => {
            reportError(
                new Error(
                    `Error getting multiple epic tests from Google Docs. ${
                        err.message
                    }. Stack: ${err.stack}`
                ),
                {
                    feature: 'epic',
                },
                false
            );
            return [];
        });

export const getEngagementBannerTestsFromGoogleDoc = (): Promise<
    $ReadOnlyArray<AcquisitionsABTest>
> =>
    getGoogleDoc(bannerMultipleTestsGoogleDocUrl)
        .then(googleDocJson => {
            const sheets = googleDocJson && googleDocJson.sheets;

            if (!sheets) {
                return [];
            }

            return Object.keys(sheets)
                .filter(testName => testName.endsWith('__ON'))
                .map(name => {
                    const rows = sheets[name];
                    const testName = name.split('__ON')[0];
                    return {
                        id: testName,
                        campaignId: testName,
                        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',

                        start: '2018-01-01',
                        expiry: '2020-01-01',

                        author: 'Google Docs',
                        description: 'Google Docs',
                        successMeasure: 'AV2.0',
                        idealOutcome: 'Google Docs',
                        audienceCriteria: 'All',
                        audience: 1,
                        audienceOffset: 0,

                        canRun: () => true,

                        variants: rows.map(row => ({
                            id: row.name.trim().toLowerCase(),
                            products: [],
                            test: () => {},

                            engagementBannerParams: {
                                messageText: row.messageText.trim(),
                                ctaText: `<span class="engagement-banner__highlight"> ${row.ctaText.replace(
                                    /%%CURRENCY_SYMBOL%%/g,
                                    getLocalCurrencySymbol()
                                )}</span>`,
                                buttonCaption: row.buttonCaption.trim(),
                                linkUrl: row.linkUrl.trim(),
                                hasTicker: false,
                            },
                        })),
                    };
                });
        })
        .catch((err: Error) => {
            reportError(
                new Error(
                    `Error getting multiple engagement banner tests from Google Docs. ${
                        err.message
                    }. Stack: ${err.stack}`
                ),
                {
                    feature: 'engagement-banner',
                },
                false
            );
            return [];
        });

export {
    pageShouldHideReaderRevenue,
    shouldShowEpic,
    makeEpicABTest,
    defaultButtonTemplate,
    defaultMaxViews,
    getReaderRevenueRegion,
};
