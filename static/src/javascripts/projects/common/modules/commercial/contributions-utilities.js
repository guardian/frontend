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
import { noop } from 'lib/noop';
import { splitAndTrim, optionalSplitAndTrim } from 'lib/string-utils';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { epicLiveBlogTemplate } from 'common/modules/commercial/templates/acquisitions-epic-liveblog';
import { userIsSupporter } from 'common/modules/commercial/user-features';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { awaitEpicButtonClicked } from 'common/modules/commercial/epic/epic-utils';
import { setupEpicInLiveblog } from 'common/modules/commercial/contributions-liveblog-utilities';
import {
    epicMultipleTestsGoogleDocUrl,
    getBannerGoogleDoc,
    getGoogleDoc,
    googleDocEpicControl,
} from 'common/modules/commercial/contributions-google-docs';
import {
    defaultExclusionRules,
    isArticleWorthAnEpicImpression,
} from 'common/modules/commercial/epic/epic-exclusion-rules';
import { getAcquisitionsBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';

export type CtaUrls = {
    supportUrl: string,
};

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

const defaultButtonTemplate = (url: CtaUrls) => epicButtonsTemplate(url);

const controlTemplate: EpicTemplate = (
    { options = {} },
    copy: AcquisitionsEpicTemplateCopy
) =>
    acquisitionsEpicControlTemplate({
        copy,
        componentName: options.componentName,
        buttonTemplate: options.buttonTemplate
            ? options.buttonTemplate({
                  supportUrl: options.supportURL,
                  subscribeUrl: options.subscribeURL,
              })
            : undefined,
    });

const liveBlogTemplate: EpicTemplate = (
    { options = {} },
    copy: AcquisitionsEpicTemplateCopy
) =>
    epicLiveBlogTemplate({
        copy,
        componentName: options.componentName,
        supportURL: options.supportURL,
    });

const doTagsMatch = (test: EpicABTest): boolean =>
    test.useTargetingTool ? isAbTestTargeted(test) : true;

// Returns an array containing:
// - the first element matching insertAtSelector, if isMultiple is false or not supplied
// - all elements matching insertAtSelector, if isMultiple is true
// - or an empty array if the selector doesn't match anything on the page
const getTargets = (
    insertAtSelector: string,
    isMultiple: boolean
): Array<HTMLElement> => {
    const els = Array.from(document.querySelectorAll(insertAtSelector));

    if (isMultiple) {
        return els;
    } else if (els.length) {
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

    const storedGeolocation = geolocationGetSync();
    const inCompatibleLocation = test.locations.length
        ? test.locations.some(geo => geo === storedGeolocation)
        : true;

    const tagsMatch = doTagsMatch(test);

    const isCompatibleUser = test.onlyShowToExistingSupporters
        ? userIsSupporter()
        : !userIsSupporter();

    return (
        !pageShouldHideReaderRevenue() &&
        onCompatiblePage &&
        isCompatibleUser &&
        inCompatibleLocation &&
        tagsMatch
    );
};

const createTestAndVariantId = (campaignCodePrefix, campaignID, id) =>
    `${campaignCodePrefix}_${campaignID}_${id}`;

const makeEvent = (id: string, event: string): string => `${id}:${event}`;

const registerIframeListener = (iframeId: string) => {
    window.addEventListener('message', message => {
        const iframe = document.getElementById(iframeId);

        if (iframe) {
            try {
                const data = JSON.parse(message.data);

                if (data.type === 'set-height' && data.value) {
                    iframe.style.height = `${data.value}px`;
                }
            } catch (e) {
                // Nothing we can do in the error case
            }
        }
    });
};

const pageMatchesTags = (tagIds: string[]): boolean =>
    tagIds.some(tagId =>
        `${config.get('page.keywordIds')},${config.get(
            'page.nonKeywordTagIds'
        )}`.includes(tagId)
    );

const pageMatchesSections = (sectionIds: string[]): boolean =>
    sectionIds.some(section => config.get('page.section') === section);

const makeABTestVariant = (
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    test?: (html: string, abTest: ABTest) => void,
    deploymentRules: DeploymentRules = defaultMaxViews,
    options: Object,
    template: EpicTemplate,
    parentTest: EpicABTest
): Variant => {
    const trackingCampaignId = `epic_${parentTest.campaignId}`;
    const componentId = createTestAndVariantId(
        parentTest.campaignPrefix,
        parentTest.campaignId,
        id
    );
    const iframeId = `${parentTest.campaignId}_iframe`;

    // defaults for options
    const {
        // filters, where empty is taken to mean 'all', multiple entries are combined with OR
        locations = [],
        tagIds = [],
        sections = [],
        excludedTagIds = [],
        excludedSections = [],

        isUnlimited = false,    // Deprecated in favour of DeploymentRules, TODO - remove later
        campaignCode = createTestAndVariantId(
            parentTest.campaignPrefix,
            parentTest.campaignId,
            id
        ),
        supportURL = addTrackingCodesToUrl({
            base: `${options.supportBaseURL || supportContributeURL}`,
            componentType: parentTest.componentType,
            componentId,
            campaignCode,
            abTest: {
                name: parentTest.id,
                variant: id,
            },
        }),
        subscribeURL = addTrackingCodesToUrl({
            base: 'https://support.theguardian.com/subscribe',
            componentType: parentTest.componentType,
            componentId,
            campaignCode,
            abTest: {
                name: parentTest.id,
                variant: id,
            },
        }),
        buttonTemplate = options.buttonTemplate,
        blockEngagementBanner = false,
        engagementBannerParams = {},
        isOutbrainCompliant = false,
        usesIframe = false,
        onInsert = noop,
        onView = noop,
        insertAtSelector = '.submeta',
        insertMultiple = false,
        insertAfter = false,
        impression = submitABTestImpression =>
            mediator.once(parentTest.insertEvent, () => {
                submitInsertEvent({
                    component: {
                        componentType: parentTest.componentType,
                        products,
                        campaignCode,
                        id: campaignCode,
                    },
                    abTest: {
                        name: parentTest.id,
                        variant: id,
                    },
                });

                submitABTestImpression();
            }),
        success = submitABTestComplete =>
            mediator.once(parentTest.viewEvent, () => {
                submitViewEvent({
                    component: {
                        componentType: parentTest.componentType,
                        products,
                        campaignCode,
                        id: campaignCode,
                    },
                    abTest: {
                        name: parentTest.id,
                        variant: id,
                    },
                });
                submitABTestComplete();
            }),
    } = options;

    if (usesIframe) {
        registerIframeListener(iframeId);
    }

    return {
        id,

        options: {
            componentName: `mem_acquisition_${trackingCampaignId}_${id}`,
            campaignCodes: [campaignCode],

            isUnlimited,
            products,
            campaignCode,
            supportURL,
            subscribeURL,
            template,
            buttonTemplate,
            blockEngagementBanner,
            engagementBannerParams,
            isOutbrainCompliant,
            usesIframe,
            onInsert,
            onView,
            insertAtSelector,
            insertMultiple,
            insertAfter,
            impression,
            success,
            iframeId,
        },

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

                return (withinViewLimit && enoughDaysBetweenViews) || isUnlimited;
            };

            const meetsMaxViewsConditions = deploymentRules === 'AlwaysAsk' ? true : checkMaxViews(deploymentRules);

            const matchesLocations =
                locations.length === 0 ||
                locations.some(
                    region => geolocationGetSync() === region.toUpperCase()
                );

            const matchesTags = tagIds.length === 0 || pageMatchesTags(tagIds);
            const matchesSections =
                sections.length === 0 || pageMatchesSections(sections);
            const noExcludedTags = !pageMatchesTags(excludedTagIds);
            const notExcludedSection = !pageMatchesSections(excludedSections);

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
            if (typeof options.copy === 'function') {
                options.copy = options.copy();
            }

            const copyPromise: Promise<AcquisitionsEpicTemplateCopy> =
                (options.copy && Promise.resolve(options.copy)) ||
                googleDocEpicControl();

            copyPromise
                .then((copy: AcquisitionsEpicTemplateCopy) =>
                    this.options.template(this, copy)
                )
                .then(renderedTemplate => {
                    if (test) {
                        test(renderedTemplate, this);
                    } else {
                        // Standard epic insertion. TODO - this could do with a refactor
                        const component = $.create(renderedTemplate);

                        mediator.emit('register:begin', trackingCampaignId);

                        return fastdom.write(() => {
                            const targets = getTargets(
                                insertAtSelector,
                                insertMultiple
                            );

                            awaitEpicButtonClicked().then(() =>
                                submitClickEvent({
                                    component: {
                                        componentType: parentTest.componentType,
                                        products,
                                        campaignCode,
                                        id: campaignCode,
                                    },
                                    abTest: {
                                        name: parentTest.id,
                                        variant: id,
                                    },
                                })
                            );

                            if (targets.length > 0) {
                                if (insertAfter) {
                                    component.insertAfter(targets);
                                } else {
                                    component.insertBefore(targets);
                                }

                                mediator.emit(parentTest.insertEvent, {
                                    componentType: parentTest.componentType,
                                    products,
                                    campaignCode,
                                });
                                onInsert(component);

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
                                            products,
                                            campaignCode,
                                        });
                                        mediator.emit(
                                            'register:end',
                                            trackingCampaignId
                                        );
                                        onView(this);
                                    });
                                });
                            }

                            return component[0];
                        });
                    }
                });
        },
        impression,
        success,
    };
};

const makeABTest = ({
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
    // locations is a filter where empty is taken to mean 'all'
    locations = [],
    dataLinkNames = '',
    campaignPrefix = 'gdnwb_copts_memco',
    useLocalViewLog = false,
    overrideCanRun = false,
    useTargetingTool = false,
    onlyShowToExistingSupporters = false,
    canRun = () => true,
    pageCheck = isCompatibleWithArticleEpic,
    template = controlTemplate,
}: InitEpicABTest): EpicABTest => {
    const test = {
        // this is true because we use the reader revenue flag rather than sensitive
        // to disable contributions asks for a particular piece of content
        showForSensitive: true,
        canRun() {
            if (overrideCanRun) {
                return doTagsMatch(this) && canRun(this);
            }

            const testCanRun =
                typeof canRun === 'function' ? canRun(this) : true;
            const canEpicBeDisplayed = shouldShowEpic(this);

            return testCanRun && canEpicBeDisplayed;
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
        dataLinkNames,
        campaignId,
        campaignPrefix,
        useLocalViewLog,
        overrideCanRun,
        onlyShowToExistingSupporters,
        pageCheck,
        locations,
        useTargetingTool,
    };

    test.variants = variants.map(variant =>
        makeABTestVariant(
            variant.id,
            variant.products,
            variant.test,
            variant.deploymentRules,
            variant.options || {},
            template,
            test
        )
    );

    return test;
};

const makeBannerABTestVariants = (
    variants: Array<Object>
): $ReadOnlyArray<Variant> =>
    variants.map(x => {
        x.test = noop;
        return x;
    });

const makeGoogleDocBannerVariants = (
    count: number
): Array<InitBannerABTestVariant> => {
    const variants = [];

    for (let i = 1; i <= count; i += 1) {
        variants.push({
            id: `variant_${i}`,
            products: [],
            engagementBannerParams: () =>
                getBannerGoogleDoc().then(res =>
                    getAcquisitionsBannerParams(res, `variant_${i}`)
                ),
        });
    }
    return variants;
};

const makeGoogleDocBannerControl = (): InitBannerABTestVariant => ({
    id: 'control',
    products: [],
    engagementBannerParams: () =>
        getBannerGoogleDoc().then(res =>
            getAcquisitionsBannerParams(res, 'control')
        ),
});

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
                    return makeABTest({
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
                            id: row.name,
                            products: [],
                            ...(isLiveBlog
                                ? { test: setupEpicInLiveblog }
                                : {}),
                            deploymentRules: (row.alwaysAsk && row.alwaysAsk.toLowerCase() === 'true') ? 'AlwaysAsk' : ({
                                days:
                                    parseInt(row.maxViewsDays, 10) ||
                                    defaultMaxViews.days,
                                count:
                                    parseInt(row.maxViewsCount, 10) ||
                                    defaultMaxViews.count,
                                minDaysBetweenViews:
                                    parseInt(row.minDaysBetweenViews, 10) ||
                                    defaultMaxViews.minDaysBetweenViews,
                            }: MaxViews),

                            options: {
                                buttonTemplate: isThankYou
                                    ? undefined
                                    : defaultButtonTemplate,
                                locations: optionalSplitAndTrim(
                                    row.locations,
                                    ','
                                ),
                                tagIds: optionalSplitAndTrim(row.tagIds, ','),
                                sections: optionalSplitAndTrim(
                                    row.sections,
                                    ','
                                ),
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
                                    paragraphs: splitAndTrim(
                                        row.paragraphs,
                                        '\n'
                                    ),
                                    highlightedText: row.highlightedText
                                        ? row.highlightedText.replace(
                                              /%%CURRENCY_SYMBOL%%/g,
                                              getLocalCurrencySymbol()
                                          )
                                        : undefined,
                                },
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
                    feature: 'epic-test',
                },
                false
            );
            return [];
        });

export {
    pageShouldHideReaderRevenue,
    shouldShowEpic,
    makeABTest,
    defaultButtonTemplate,
    makeBannerABTestVariants,
    defaultMaxViews,
    getReaderRevenueRegion,
    makeGoogleDocBannerControl,
    makeGoogleDocBannerVariants,
};
