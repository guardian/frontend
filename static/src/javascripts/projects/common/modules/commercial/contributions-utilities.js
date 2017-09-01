// @flow
import targetingTool from 'common/modules/commercial/targeting-tool';
import {
    regulars as acquisitionsCopyRegulars,
    control as acquisitionsCopyControl,
} from 'common/modules/commercial/acquisitions-copy';
import type { AcquisitionsEpicTemplateCopy } from 'common/modules/commercial/acquisitions-copy';
import { control as acquisitionsTestimonialParametersControl } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import type { AcquisitionsEpicTestimonialTemplateParameters } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import { logView } from 'common/modules/commercial/acquisitions-view-log';
import {
    submitInsertEvent,
    submitViewEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import { isRegular } from 'common/modules/tailor/tailor';
import $ from 'lib/$';
import config from 'lib/config';
import { elementInView } from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { constructQuery as constructURLQuery } from 'lib/url';
import { noop } from 'lib/noop';
import lodashTemplate from 'lodash/utilities/template';
import toArray from 'lodash/collections/toArray';
import acquisitionsEpicButtons from 'raw-loader!common/views/acquisitions-epic-buttons.html';
import acquisitionsEpicControlTemplate from 'raw-loader!common/views/acquisitions-epic-control.html';
import acquisitionsTestimonialBlockTemplate from 'raw-loader!common/views/acquisitions-epic-testimonial-block.html';
import { shouldSeeReaderRevenue as userShouldSeeReaderRevenue } from 'commercial/modules/user-features';

type EpicTemplate = (Variant, AcquisitionsEpicTemplateCopy) => string;

type CtaUrls = {
    membershipUrl?: string,
    contributeUrl?: string,
    supportUrl?: string,
};

const membershipBaseURL = 'https://membership.theguardian.com/supporter';
const contributionsBaseURL = 'https://contribute.theguardian.com';
const supportBaseURL = 'https://support.theguardian.com/uk';

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

const defaultButtonTemplate = (urls: CtaUrls) =>
    lodashTemplate(acquisitionsEpicButtons, urls);

const controlTemplate: EpicTemplate = ({ options = {} }, copy) =>
    lodashTemplate(acquisitionsEpicControlTemplate, {
        copy,
        componentName: options.componentName,
        testimonialBlock: options.testimonialBlock,
        buttonTemplate: options.buttonTemplate({
            membershipUrl: options.membershipURL,
            contributeUrl: options.contributeURL,
            supportUrl: options.supportURL,
        }),
    });

const doTagsMatch = (test: EpicABTest): boolean =>
    test.useTargetingTool ? targetingTool.isAbTestTargeted(test) : true;

// Returns an array containing:
// - the first element matching insertAtSelector, if isMultiple is false or not supplied
// - all elements matching insertAtSelector, if isMultiple is true
// - or an empty array if the selector doesn't match anything on the page
const getTargets = (insertAtSelector, isMultiple) => {
    const els = document.querySelectorAll(insertAtSelector);

    if (isMultiple) {
        return toArray(els);
    } else if (els.length) {
        return [els[0]];
    }

    return [];
};

const getTestimonialBlock = (
    testimonialParameters: AcquisitionsEpicTestimonialTemplateParameters,
    citeImage: ?String
) =>
    lodashTemplate(acquisitionsTestimonialBlockTemplate, {
        quoteSvg: testimonialParameters.quoteSvg,
        testimonialMessage: testimonialParameters.testimonialMessage,
        testimonialName: testimonialParameters.testimonialName,
        citeImage,
    });

const defaultPageCheck = (page: Object): boolean =>
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

const defaultCanEpicBeDisplayed = (test: EpicABTest): boolean => {
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

const getCopy = (useTailor: boolean): Promise<AcquisitionsEpicTemplateCopy> => {
    if (useTailor) {
        return isRegular().then(
            regular =>
                regular ? acquisitionsCopyRegulars : acquisitionsCopyControl
        );
    }

    return Promise.resolve(acquisitionsCopyControl);
};

const getCampaignCode = (
    campaignCodePrefix,
    campaignID,
    id,
    campaignCodeSuffix
) => {
    const suffix = campaignCodeSuffix ? `_${campaignCodeSuffix}` : '';
    return `${campaignCodePrefix}_${campaignID}_${id}${suffix}`;
};

const addTrackingCodesToUrl = (base: string, campaignCode: string) => {
    const params = {
        REFPVID: config.get('ophan.pageViewId') || 'not_found',
        INTCMP: campaignCode,
    };

    return `${base}?${constructURLQuery(params)}`;
};

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
    const campaignCode = getCampaignCode(
        parentTest.campaignPrefix,
        parentTest.campaignId,
        id,
        parentTest.campaignSuffix
    );
    const iframeId = `${parentTest.campaignId}_iframe`;

    // defaults for options
    const {
        maxViews = defaultMaxViews,
        isUnlimited = false,
        contributeURL = addTrackingCodesToUrl(
            contributionsBaseURL,
            campaignCode
        ),
        membershipURL = addTrackingCodesToUrl(membershipBaseURL, campaignCode),
        supportCustomURL = null,
        supportURL = addTrackingCodesToUrl(
            supportCustomURL || supportBaseURL,
            campaignCode
        ),
        template = controlTemplate,
        buttonTemplate = defaultButtonTemplate,
        testimonialBlock = getTestimonialBlock(
            acquisitionsTestimonialParametersControl
        ),
        blockEngagementBanner = false,
        engagementBannerParams = {},
        isOutbrainCompliant = false,
        usesIframe = false,
        onInsert = noop,
        onView = noop,
        useTailoredCopyForRegulars = false,
        insertAtSelector = '.submeta',
        insertMultiple = false,
        insertAfter = false,
        test = noop,
        impression = submitABTestImpression =>
            mediator.once(parentTest.insertEvent, () => {
                submitInsertEvent(
                    parentTest.componentType,
                    products,
                    campaignCode
                );
                submitABTestImpression();
            }),
        success = submitABTestComplete =>
            mediator.once(parentTest.viewEvent, () => {
                submitViewEvent(
                    parentTest.componentType,
                    products,
                    campaignCode
                );
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
            contributeURL,
            membershipURL,
            supportURL,
            template,
            buttonTemplate,
            testimonialBlock,
            blockEngagementBanner,
            engagementBannerParams,
            isOutbrainCompliant,
            usesIframe,
            onInsert,
            onView,
            useTailoredCopyForRegulars,
            insertAtSelector,
            insertMultiple,
            insertAfter,
            test,
            impression,
            success,
            iframeId,
        },

        test() {
            const render = (templateFn: ?EpicTemplate) =>
                getCopy(useTailoredCopyForRegulars)
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

        contributionsURLBuilder(codeModifier) {
            return addTrackingCodesToUrl(
                contributionsBaseURL,
                codeModifier(campaignCode)
            );
        },

        membershipURLBuilder(codeModifier) {
            return addTrackingCodesToUrl(
                membershipBaseURL,
                codeModifier(campaignCode)
            );
        },
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
    campaignSuffix = '',
    useLocalViewLog = false,
    overrideCanRun = false,
    useTargetingTool = false,
    showToContributorsAndSupporters = false,
    canRun = () => true,
    pageCheck = defaultPageCheck,
}: InitEpicABTest): EpicABTest => {
    const test = {
        // this is true because we use the reader revenue flag rather than sensitive
        // to disable contributions asks for a particular piece of content
        showForSensitive: true,
        canRun() {
            if (overrideCanRun) {
                return doTagsMatch(this) && canRun();
            }

            const testCanRun = typeof canRun === 'function' ? canRun() : true;
            const canEpicBeDisplayed = defaultCanEpicBeDisplayed(this);

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
        campaignSuffix,
        useLocalViewLog,
        overrideCanRun,
        showToContributorsAndSupporters,
        pageCheck,
        locations,
        locationCheck,
        useTargetingTool,
    };

    test.variants = variants.map(variant =>
        makeABTestVariant(variant.id, variant.products, variant.options, test)
    );

    return test;
};

export {
    shouldShowReaderRevenue,
    defaultCanEpicBeDisplayed,
    defaultPageCheck,
    getTestimonialBlock,
    addTrackingCodesToUrl,
    makeABTest,
    defaultButtonTemplate,
};
