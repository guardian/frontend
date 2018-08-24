// @flow
import { isAbTestTargeted } from 'common/modules/commercial/targeting-tool';
import { getEpicParams } from 'common/modules/commercial/acquisitions-copy';
import { getAcquisitionsBannerParams } from 'common/modules/commercial/membership-engagement-banner-parameters';
import { logView } from 'common/modules/commercial/acquisitions-view-log';
import {
    submitClickEvent,
    submitInsertEvent,
    submitViewEvent,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/acquisitions-ophan';
import $ from 'lib/$';
import config from 'lib/config';
import { elementInView } from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { noop } from 'lib/noop';
import { epicButtonsTemplate } from 'common/modules/commercial/templates/acquisitions-epic-buttons';
import { acquisitionsEpicControlTemplate } from 'common/modules/commercial/templates/acquisitions-epic-control';
import { shouldSeeReaderRevenue as userShouldSeeReaderRevenue } from 'common/modules/commercial/user-features';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import { awaitEpicButtonClicked } from 'common/modules/commercial/epic/epic-utils';
import {
    getEpicGoogleDoc,
    getBannerGoogleDoc,
    googleDocEpicControl,
} from 'common/modules/commercial/contributions-google-docs';

type EpicTemplate = (Variant, AcquisitionsEpicTemplateCopy) => string;

export type CtaUrls = {
    supportUrl: string,
};

// How many times the user can see the Epic,
// e.g. 6 times within 7 days with minimum of 1 day in between views.
const defaultMaxViews: {
    days: number,
    count: number,
    minDaysBetweenViews: number,
} = {
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
        buttonTemplate: options.buttonTemplate({
            supportUrl: options.supportURL,
        }),
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
    const els = document.querySelectorAll(insertAtSelector);

    if (isMultiple) {
        return [...els];
    } else if (els.length) {
        return [els[0]];
    }

    return [];
};

const isCompatibleWithEpic = (page: Object): boolean =>
    page.contentType === 'Article' && !page.isMinuteArticle;

const shouldShowReaderRevenue = (
    showToContributorsAndSupporters: boolean = false
): boolean => {
    const isMasterclassesPage = config
        .get('page.keywordIds', '')
        .includes('guardian-masterclasses/guardian-masterclasses');

    return (
        (userShouldSeeReaderRevenue() || showToContributorsAndSupporters) &&
        !isMasterclassesPage &&
        !config.get('page.shouldHideReaderRevenue')
    );
};

const isEpicDisplayable = (): boolean => {
    const page = config.get('page');
    if (!page) {
        return false;
    }
    return isCompatibleWithEpic(page) && shouldShowReaderRevenue();
};

const shouldShowEpic = (test: EpicABTest): boolean => {
    const worksWellWithPageTemplate = test.pageCheck(config.get('page'));

    const storedGeolocation = geolocationGetSync();
    const inCompatibleLocation = test.locations.length
        ? test.locations.some(geo => geo === storedGeolocation)
        : true;

    const tagsMatch = doTagsMatch(test);

    return (
        shouldShowReaderRevenue(test.showToContributorsAndSupporters) &&
        worksWellWithPageTemplate &&
        inCompatibleLocation &&
        test.locationCheck(storedGeolocation) &&
        tagsMatch
    );
};

const getCampaignCode = (campaignCodePrefix, campaignID, id) =>
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

const makeABTestVariant = (
    id: string,
    products: $ReadOnlyArray<OphanProduct>,
    options: Object,
    parentTest: EpicABTest
): Variant => {
    const trackingCampaignId = `epic_${parentTest.campaignId}`;
    const iframeId = `${parentTest.campaignId}_iframe`;

    // defaults for options
    const {
        maxViews = defaultMaxViews,
        isUnlimited = false,
        campaignCode = getCampaignCode(
            parentTest.campaignPrefix,
            parentTest.campaignId,
            id
        ),
        supportURL = addTrackingCodesToUrl({
            base: `${options.supportBaseURL || supportContributeURL}`,
            componentType: parentTest.componentType,
            componentId: campaignCode,
            campaignCode,
            abTest: {
                name: parentTest.id,
                variant: id,
            },
        }),
        template = controlTemplate,
        buttonTemplate = options.buttonTemplate || defaultButtonTemplate,
        blockEngagementBanner = false,
        engagementBannerParams = {},
        isOutbrainCompliant = false,
        usesIframe = false,
        onInsert = noop,
        onView = noop,
        insertAtSelector = '.submeta',
        insertMultiple = false,
        insertAfter = false,
        test = noop,
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

            maxViews,
            isUnlimited,
            products,
            campaignCode,
            supportURL,
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
            test,
            impression,
            success,
            iframeId,
        },

        test() {
            if (typeof options.copy === 'function') {
                options.copy = options.copy();
            }

            const copyPromise: Promise<AcquisitionsEpicTemplateCopy> =
                (options.copy && Promise.resolve(options.copy)) ||
                googleDocEpicControl();

            const render = (templateFn: ?EpicTemplate) =>
                copyPromise
                    .then((copy: AcquisitionsEpicTemplateCopy) => {
                        const renderTemplate: EpicTemplate =
                            templateFn ||
                            (this.options && this.options.template);
                        return renderTemplate(this, copy);
                    })
                    .then(renderedTemplate => {
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
                    });

            if (test !== noop && typeof test === 'function') {
                test(render.bind(this), this, parentTest);
            } else {
                render.apply(this);
            }
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
    locationCheck = () => true,
    dataLinkNames = '',
    campaignPrefix = 'gdnwb_copts_memco',
    useLocalViewLog = false,
    overrideCanRun = false,
    useTargetingTool = false,
    showToContributorsAndSupporters = false,
    canRun = () => true,
    pageCheck = isCompatibleWithEpic,
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
        showToContributorsAndSupporters,
        pageCheck,
        locations,
        locationCheck,
        useTargetingTool,
    };

    test.variants = variants.map(variant =>
        makeABTestVariant(
            variant.id,
            variant.products,
            variant.options || {},
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

const makeGoogleDocEpicVariants = (count: number): Array<Object> => {
    const variants = [];

    // wtf, our linter dislikes i++ AND i = i + 1
    for (let i = 1; i <= count; i += 1) {
        variants.push({
            id: `variant_${i}`,
            products: [],
            options: {
                copy: () =>
                    getEpicGoogleDoc.then(res =>
                        getEpicParams(res, `variant_${i}`)
                    ),
            },
        });
    }
    return variants;
};

const makeGoogleDocBannerVariants = (
    count: number
): Array<InitBannerABTestVariant> => {
    const variants = [];

    for (let i = 1; i <= count; i += 1) {
        variants.push({
            id: `variant_${i}`,
            products: [],
            engagementBannerParams: () =>
                getBannerGoogleDoc.then(res =>
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
        getBannerGoogleDoc.then(res =>
            getAcquisitionsBannerParams(res, 'control')
        ),
});

export {
    shouldShowReaderRevenue,
    shouldShowEpic,
    makeABTest,
    defaultButtonTemplate,
    makeBannerABTestVariants,
    makeGoogleDocEpicVariants,
    makeGoogleDocBannerVariants,
    makeGoogleDocBannerControl,
    defaultMaxViews,
    isEpicDisplayable,
};
