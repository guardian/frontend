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
    getCountryName,
} from 'lib/geolocation';
import {
    optionalSplitAndTrim,
    optionalStringToBoolean,
    filterEmptyString,
} from 'lib/string-utils';
import { throwIfEmptyArray } from 'lib/array-utils';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import {
    shouldHideSupportMessaging,
    isPostAskPauseOneOffContributor,
} from 'common/modules/commercial/user-features';
import {
    supportContributeURL,
    supportSubscribeGeoRedirectURL,
    addCountryGroupToSupportLink,
} from 'common/modules/commercial/support-utilities';
import { awaitEpicButtonClicked } from 'common/modules/commercial/epic/epic-utils';
import { setupEpicInLiveblog } from 'common/modules/commercial/contributions-liveblog-utilities';
import {
    bannerMultipleTestsGoogleDocUrl,
    getGoogleDoc,
} from 'common/modules/commercial/contributions-google-docs';
import { getEpicTestData } from 'common/modules/commercial/contributions-epic-test-data';
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
        epicClassNames: variant.classNames,
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
    config.get('page.shouldHideReaderRevenue') ||
    config.get('page.sponsorshipType') === 'paid-content';

const userIsInCorrectCohort = (
    userCohort: AcquisitionsComponentUserCohort
): boolean => {
    switch (userCohort) {
        case 'PostAskPauseSingleContributors':
            return (
                isPostAskPauseOneOffContributor() &&
                !shouldHideSupportMessaging()
            );
        case 'AllExistingSupporters':
            return shouldHideSupportMessaging();
        case 'AllNonSupporters':
            return !shouldHideSupportMessaging();
        case 'Everyone':
        default:
            return true;
    }
};

const isValidCohort = (cohort: string): boolean =>
    [
        'AllExistingSupporters',
        'AllNonSupporters',
        'Everyone',
        'PostAskPauseSingleContributors',
    ].includes(cohort);

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

const userMatchesCountryGroups = (
    countryGroups: string[],
    geolocation: ?string
) => {
    const userCountryGroupId = geolocation
        ? countryCodeToCountryGroupId(geolocation).toUpperCase()
        : undefined;
    return countryGroups.some(
        countryGroup => userCountryGroupId === countryGroup.toUpperCase()
    );
};

const pageMatchesSections = (sectionIds: string[]): boolean =>
    sectionIds.some(section => config.get('page.section') === section);

const copyHasVariables = (text: ?string): boolean =>
    !!text && text.includes('%%');

const countryNameIsOk = (
    testHasCountryName: boolean,
    geolocation: ?string
): boolean => (testHasCountryName ? !!getCountryName(geolocation) : true);

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
        classNames: initVariant.classNames || [],
        showTicker: initVariant.showTicker || false,
        backgroundImageUrl: initVariant.backgroundImageUrl,
        deploymentRules,

        countryGroups: initVariant.countryGroups || [],
        tagIds: initVariant.tagIds || [],
        sections: initVariant.sections || [],
        excludedTagIds: initVariant.excludedTagIds || [],
        excludedSections: initVariant.excludedSections || [],

        canRun() {
            const copyIsValid = () =>
                !this.copy ||
                (!copyHasVariables(this.copy.heading) &&
                    !this.copy.paragraphs.some(copyHasVariables) &&
                    !copyHasVariables(this.copy.highlightedText));

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
                userMatchesCountryGroups(
                    this.countryGroups,
                    parentTest.geolocation
                );

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
                notExcludedSection &&
                copyIsValid()
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
                        const parent = parentTest;
                        initVariant.test(renderedTemplate, this, parent);
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
    geolocation,
    highPriority,

    // optional params
    campaignPrefix = 'gdnwb_copts_memco',
    useLocalViewLog = false,
    useTargetingTool = false,
    userCohort = 'AllNonSupporters',
    testHasCountryName = false,
    pageCheck = isCompatibleWithArticleEpic,
    template = controlTemplate,
    canRun = () => true,
}: InitEpicABTest): EpicABTest => {
    const test = {
        // this is true because we use the reader revenue flag rather than sensitive
        // to disable contributions asks for a particular piece of content
        showForSensitive: true,
        geolocation,
        highPriority,
        canRun() {
            return (
                canRun() &&
                countryNameIsOk(testHasCountryName, geolocation) &&
                shouldShowEpic(this)
            );
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

const buildEpicCopy = (
    row: any,
    testHasCountryName: boolean,
    geolocation: ?string
) => {
    const heading = row.heading;

    const paragraphs: string[] = throwIfEmptyArray(
        'paragraphs',
        row.paragraphs
    );

    const countryName: ?string = testHasCountryName
        ? getCountryName(geolocation)
        : undefined;

    return {
        heading:
            heading && countryName
                ? replaceCountryName(heading, countryName)
                : heading,
        paragraphs:
            paragraphs && countryName
                ? paragraphs.map<string>(para =>
                      replaceCountryName(para, countryName)
                  )
                : paragraphs,
        highlightedText: row.highlightedText
            ? row.highlightedText.replace(
                  /%%CURRENCY_SYMBOL%%/g,
                  getLocalCurrencySymbol(geolocation)
              )
            : undefined,
        footer: optionalSplitAndTrim(row.footer, '\n'),
    };
};

const buildBannerCopy = (
    text: string,
    testHasCountryName: boolean,
    geolocation: ?string
): string => {
    const countryName: ?string = testHasCountryName
        ? getCountryName(geolocation)
        : undefined;

    return countryName ? replaceCountryName(text, countryName) : text;
};

export const buildConfiguredEpicTestFromJson = (test: Object): EpicABTest => {
    const geolocation = geolocationGetSync();

    const countryGroups = test.locations;
    const tagIds = test.tagIds;
    const sections = test.sections;
    const excludedTagIds = test.excludedTagIds;
    const excludedSections = test.excludedSections;

    const parseMaxViews = (): MaxViews =>
        test.maxViews
            ? ({
                  days: test.maxViews.maxViewsDays,
                  count: test.maxViews.maxViewsCount,
                  minDaysBetweenViews: test.maxViews.minDaysBetweenViews,
              }: MaxViews)
            : defaultMaxViews;

    const deploymentRules = test.alwaysAsk ? 'AlwaysAsk' : parseMaxViews();

    return makeEpicABTest({
        id: test.name,
        campaignId: test.name,
        geolocation,
        highPriority: test.highPriority,

        start: '2018-01-01',
        expiry: '2025-01-01',

        author: 'Epic test tool',
        description: 'Epic test tool',
        successMeasure: 'AV2.0',
        idealOutcome: 'Epic test tool',
        audienceCriteria: 'All',
        audience: parseFloat(test.audience) ? test.audience : 1,
        audienceOffset: parseFloat(test.audienceOffset)
            ? test.audienceOffset
            : 0,
        useLocalViewLog: test.useLocalViewLog,
        userCohort:
            test.userCohort && isValidCohort(test.userCohort)
                ? test.userCohort
                : 'AllNonSupporters',
        ...(test.isLiveBlog
            ? {
                  template: liveBlogTemplate,
                  pageCheck: isCompatibleWithLiveBlogEpic,
              }
            : {
                  template: controlTemplate,
                  pageCheck: isCompatibleWithArticleEpic,
              }),
        // If testHasCountryName is true but a country name is not available for this user then
        // they will be excluded from this test
        testHasCountryName: test.hasCountryName,

        variants: test.variants.map(variant => ({
            id: variant.name,
            ...(test.isLiveBlog ? { test: setupEpicInLiveblog } : {}),
            ...(variant.cta
                ? {
                      buttonTemplate: defaultButtonTemplate,
                      ctaText: variant.cta.text,
                      supportBaseURL: variant.cta.baseURL,
                  }
                : {}),
            copy: buildEpicCopy(variant, test.hasCountryName, geolocation),
            classNames: [
                `contributions__epic--${test.name}`,
                `contributions__epic--${test.name}-${variant.name}`,
            ],
            showTicker: optionalStringToBoolean(variant.showTicker),
            backgroundImageUrl: filterEmptyString(variant.backgroundImageUrl),
            // TODO - why are these fields at the variant level?
            deploymentRules,
            countryGroups,
            tagIds,
            sections,
            excludedTagIds,
            excludedSections,
        })),
    });
};

export const getConfiguredEpicTests = (): Promise<$ReadOnlyArray<EpicABTest>> =>
    getEpicTestData()
        .then(epicTestData => {
            const showDrafts = window.location.hash === '#show-draft-epics';
            if (epicTestData.tests) {
                return epicTestData.tests
                    .filter(test => test.isOn || showDrafts)
                    .map(buildConfiguredEpicTestFromJson);
            }
            return [];
        })
        .catch((err: Error) => {
            reportError(
                new Error(
                    `Error getting multiple configured epic tests. ${
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
    userCohort: AcquisitionsComponentUserCohort = 'AllNonSupporters'
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

                    // If testHasCountryName is true but a country name is not available for this user then
                    // they will be excluded from this test
                    const testHasCountryName = rows.some(row =>
                        optionalStringToBoolean(row.hasCountryName)
                    );

                    const rowWithLocations = rows.find(
                        row =>
                            row.locations !== undefined && row.locations !== ''
                    );
                    const countryGroups = rowWithLocations
                        ? optionalSplitAndTrim(rowWithLocations.locations, ',')
                        : [];

                    const geolocation = geolocationGetSync();

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

                        geolocation,
                        canRun: () => {
                            const matchesCountryGroups =
                                countryGroups.length === 0 ||
                                userMatchesCountryGroups(
                                    countryGroups,
                                    geolocation
                                );

                            return (
                                countryNameIsOk(
                                    testHasCountryName,
                                    geolocation
                                ) && matchesCountryGroups
                            );
                        },

                        variants: rows.map(row => {
                            const leadSentence = row.leadSentence
                                ? buildBannerCopy(
                                      row.leadSentence.trim(),
                                      testHasCountryName,
                                      geolocation
                                  )
                                : undefined;

                            const messageText = buildBannerCopy(
                                row.messageText.trim(),
                                testHasCountryName,
                                geolocation
                            );

                            const ctaText = `<span class="engagement-banner__highlight"> ${row.ctaText.replace(
                                /%%CURRENCY_SYMBOL%%/g,
                                getLocalCurrencySymbol(geolocation)
                            )}</span>`;

                            return {
                                id: row.name.trim().toLowerCase(),
                                products: [],
                                test: () => {},

                                engagementBannerParams: {
                                    leadSentence,
                                    messageText,
                                    ctaText,
                                    buttonCaption: row.buttonCaption.trim(),
                                    linkUrl: row.linkUrl.trim(),
                                    hasTicker: false,
                                },
                                canRun: () => {
                                    const copyIsValid = () =>
                                        !copyHasVariables(leadSentence) &&
                                        !copyHasVariables(messageText) &&
                                        !copyHasVariables(ctaText);

                                    return canShowBannerSync() && copyIsValid();
                                },
                            };
                        }),
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
    buildBannerCopy,
};
