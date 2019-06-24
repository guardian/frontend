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
import { local } from 'lib/storage';
import { elementInView } from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';
import mediator from 'lib/mediator';
import {
    getLocalCurrencySymbol,
    getSync as geolocationGetSync,
    countryCodeToCountryGroupId,
    countryNames,
} from 'lib/geolocation';
import {
    splitAndTrim,
    optionalSplitAndTrim,
    optionalStringToBoolean,
    throwIfEmptyString,
    filterEmptyString,
} from 'lib/string-utils';
import { throwIfEmptyArray } from 'lib/array-utils';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import {
    supportContributeURL,
    supportSubscribeGeoRedirectURL,
    addCountryGroupToSupportLink,
} from 'common/modules/commercial/support-utilities';
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
import { initTicker } from 'common/modules/commercial/ticker';

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

const getVisitCount = (): number => local.get('gu.alreadyVisited') || 0;

const replaceCountryName = (text: string, countryName: string): string =>
    text.replace(/%%COUNTRY_NAME%%/g, countryName);

// How many times the user can see the Epic,
// e.g. 6 times within 7 days with minimum of 1 day in between views.
const defaultMaxViews: MaxViews = {
    days: 30,
    count: 4,
    minDaysBetweenViews: 0,
};

const defaultButtonTemplate: (CtaUrls, ctaText?: string) => string = (
    url: CtaUrls,
    ctaText?: string
) => epicButtonsTemplate(url, ctaText);

const controlTemplate: EpicTemplate = (
    variant: EpicVariant,
    copy: AcquisitionsEpicTemplateCopy
) =>
    acquisitionsEpicControlTemplate({
        copy,
        componentName: variant.componentName,
        buttonTemplate: variant.buttonTemplate
            ? variant.buttonTemplate(
                  {
                      supportUrl: variant.supportURL,
                      subscribeUrl: variant.subscribeURL,
                  },
                  variant.ctaText
              )
            : undefined,
        showTicker: variant.showTicker,
        backgroundImageUrl: variant.backgroundImageUrl,
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

const userIsInCorrectCohort = (
    userCohort: AcquisitionsComponentUserCohort
): boolean => {
    switch (userCohort) {
        case 'OnlyExistingSupporters':
            return shouldHideSupportMessaging();
        case 'OnlyNonSupporters':
            return !shouldHideSupportMessaging();
        case 'Everyone':
        default:
            return true;
    }
};

const isValidCohort = (cohort: string): boolean =>
    ['OnlyExistingSupporters', 'OnlyNonSupporters', 'Everyone'].includes(
        cohort
    );

const shouldShowEpic = (test: EpicABTest): boolean => {
    const onCompatiblePage = test.pageCheck(config.get('page'));

    const tagsMatch = doTagsMatch(test);

    return (
        !pageShouldHideReaderRevenue() &&
        onCompatiblePage &&
        userIsInCorrectCohort(test.userCohort) &&
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

const userMatchesCountryGroups = (countryGroups: string[]) => {
    const userCountryGroupId = countryCodeToCountryGroupId(
        geolocationGetSync()
    ).toUpperCase();
    return countryGroups.some(
        countryGroup => userCountryGroupId === countryGroup.toUpperCase()
    );
};

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
            base: initVariant.supportBaseURL
                ? addCountryGroupToSupportLink(initVariant.supportBaseURL)
                : supportContributeURL(),
            componentType: parentTest.componentType,
            componentId,
            campaignCode,
            abTest: {
                name: parentTest.id,
                variant: initVariant.id,
            },
        }),
        subscribeURL: addTrackingCodesToUrl({
            base: supportSubscribeGeoRedirectURL,
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
        ctaText: initVariant.ctaText,
        copy: initVariant.copy,
        showTicker: initVariant.showTicker || false,
        backgroundImageUrl: initVariant.backgroundImageUrl,

        countryGroups: initVariant.countryGroups || [],
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

            const matchesCountryGroups =
                this.countryGroups.length === 0 ||
                userMatchesCountryGroups(this.countryGroups);

            const matchesTagsOrSections =
                (this.tagIds.length === 0 && this.sections.length === 0) ||
                (pageMatchesTags(this.tagIds) ||
                    pageMatchesSections(this.sections));

            const noExcludedTags = !pageMatchesTags(this.excludedTagIds);
            const notExcludedSection = !pageMatchesSections(
                this.excludedSections
            );

            return (
                meetsMaxViewsConditions &&
                matchesCountryGroups &&
                matchesTagsOrSections &&
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

                                        if (initVariant.showTicker) {
                                            initTicker('.js-epic-ticker');
                                        }
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
    userCohort = 'OnlyNonSupporters',
    hasCountryName = false,
    pageCheck = isCompatibleWithArticleEpic,
    template = controlTemplate,
    canRun = () => true,
}: InitEpicABTest): EpicABTest => {
    const test = {
        // this is true because we use the reader revenue flag rather than sensitive
        // to disable contributions asks for a particular piece of content
        showForSensitive: true,
        canRun() {
            const countryNameIsOk =
                !hasCountryName || countryNames[geolocationGetSync()];
            return canRun() && countryNameIsOk && shouldShowEpic(this);
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
        userCohort,
        pageCheck,
        useTargetingTool,
    };

    test.variants = variants.map(variant =>
        makeEpicABTestVariant(variant, template, test)
    );

    return test;
};

const buildEpicCopy = (row: any, hasCountryName: boolean) => {
    const heading = throwIfEmptyString('heading', row.heading);

    const paragraphs: string[] = throwIfEmptyArray(
        'paragraphs',
        splitAndTrim(row.paragraphs, '\n')
    );

    const countryName: ?string = hasCountryName
        ? countryNames[geolocationGetSync()]
        : undefined;

    return {
        heading:
            heading && countryName
                ? replaceCountryName(heading, countryName)
                : heading,
        paragraphs:
            paragraphs && countryName
                ? paragraphs.map<string>(para => replaceCountryName(para, countryName))
                : paragraphs,
        highlightedText: row.highlightedText
            ? row.highlightedText.replace(
                  /%%CURRENCY_SYMBOL%%/g,
                  getLocalCurrencySymbol()
              )
            : undefined,
        footer: optionalSplitAndTrim(row.footer, '\n'),
    };
};

const buildBannerCopy = (text: string, hasCountryName: boolean): string => {
    const countryName: ?string = hasCountryName
        ? countryNames[geolocationGetSync()]
        : undefined;

    return countryName ? replaceCountryName(text, countryName) : text;
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

                    // The sheet does not easily allow test-level params, so get audience/audienceOffset from the first variant where they are defined
                    const rowWithAudience = rows.find(
                        row =>
                            !(
                                Number.isNaN(parseFloat(row.audience)) ||
                                Number.isNaN(parseFloat(row.audienceOffset))
                            )
                    );
                    const audience = rowWithAudience
                        ? rowWithAudience.audience
                        : 1;
                    const audienceOffset = rowWithAudience
                        ? rowWithAudience.audienceOffset
                        : 0;

                    const rowWithUserCohort = rows.find(
                        row => row.userCohort && isValidCohort(row.userCohort)
                    );
                    const userCohort = rowWithUserCohort
                        ? rowWithUserCohort.userCohort
                        : 'OnlyNonSupporters';

                    // If hasCountryName is true but a country name is not available for this user then
                    // they will be excluded from this test
                    const hasCountryName = rows.some(row =>
                        optionalStringToBoolean(row.hasCountryName)
                    );

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
                        audience,
                        audienceOffset,
                        useLocalViewLog: rows.some(row =>
                            optionalStringToBoolean(row.useLocalViewLog)
                        ),
                        userCohort,
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
                                  userCohort: 'OnlyExistingSupporters',
                                  useLocalViewLog: true,
                              }
                            : {}),
                        hasCountryName,
                        variants: rows.map(row => ({
                            id: row.name.toLowerCase().trim(),
                            ...(isLiveBlog
                                ? { test: setupEpicInLiveblog }
                                : {}),
                            deploymentRules: optionalStringToBoolean(
                                row.alwaysAsk
                            )
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
                            ctaText: filterEmptyString(row.ctaText),
                            countryGroups: optionalSplitAndTrim(
                                row.locations,
                                ','
                            ),
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
                            copy: buildEpicCopy(row, hasCountryName),
                            showTicker: optionalStringToBoolean(row.showTicker),
                            supportBaseURL: row.supportBaseURL,
                            backgroundImageUrl: filterEmptyString(
                                row.backgroundImageUrl
                            ),
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

// This is called by individual banner AbTests in their canRun functions
// TODO - banner testing needs a refactor, as currently both canRun and canShow need to call this
export const canShowBannerSync = (
    minArticlesBeforeShowingBanner: number = 3,
    userCohort: AcquisitionsComponentUserCohort = 'OnlyNonSupporters'
): boolean => {
    const userHasSeenEnoughArticles: boolean =
        getVisitCount() >= minArticlesBeforeShowingBanner;
    const bannerIsBlockedForEditorialReasons = pageShouldHideReaderRevenue();

    return (
        userHasSeenEnoughArticles &&
        !bannerIsBlockedForEditorialReasons &&
        userIsInCorrectCohort(userCohort)
    );
};

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

                    // If hasCountryName is true but a country name is not available for this user then
                    // they will be excluded from this test
                    const hasCountryName = rows.some(row =>
                        optionalStringToBoolean(row.hasCountryName)
                    );

                    const rowWithLocations = rows.find(
                        row =>
                            row.locations !== undefined && row.locations !== ''
                    );
                    const countryGroups = rowWithLocations
                        ? optionalSplitAndTrim(rowWithLocations.locations, ',')
                        : [];

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

                        canRun: () => {
                            const countryNameOk =
                                !hasCountryName ||
                                countryNames[geolocationGetSync()];
                            const matchesCountryGroups =
                                countryGroups.length === 0 ||
                                userMatchesCountryGroups(countryGroups);

                            return countryNameOk && matchesCountryGroups;
                        },

                        variants: rows.map(row => ({
                            id: row.name.trim().toLowerCase(),
                            products: [],
                            test: () => {},

                            engagementBannerParams: {
                                messageText: buildBannerCopy(
                                    row.messageText.trim(),
                                    hasCountryName
                                ),
                                ctaText: `<span class="engagement-banner__highlight"> ${row.ctaText.replace(
                                    /%%CURRENCY_SYMBOL%%/g,
                                    getLocalCurrencySymbol()
                                )}</span>`,
                                buttonCaption: row.buttonCaption.trim(),
                                linkUrl: row.linkUrl.trim(),
                                hasTicker: false,
                            },
                            canRun: () => canShowBannerSync(),
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
    userIsInCorrectCohort,
    getVisitCount,
    buildEpicCopy,
};
