// @flow
import { commercialFeatures } from 'commercial/modules/commercial-features';
import targetingTool from 'common/modules/commercial/targeting-tool';
import {
    regulars as acquisitionsCopyRegulars,
    control as acquisitionsCopyControl,
} from 'common/modules/commercial/acquisitions-copy';
import type { AcquisitionsEpicTemplateCopy } from 'common/modules/commercial/acquisitions-copy';
import { control as acquisitionsTestimonialParametersControl } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import type { AcquisitionsEpicTestimonialTemplateParameters } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import { logView } from 'common/modules/commercial/acquisitions-view-log';
import { isRegular } from 'common/modules/tailor/tailor';
import $ from 'lib/$';
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import ElementInView from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { constructQuery as constructURLQuery } from 'lib/url';
import { noop } from 'lib/noop';
import { daysSince } from 'lib/time-utils';
import template from 'lodash/utilities/template';
import toArray from 'lodash/collections/toArray';
import acquisitionsEpicControlTemplate from 'raw-loader!common/views/acquisitions-epic-control.html';
import acquisitionsTestimonialBlockTemplate from 'raw-loader!common/views/acquisitions-epic-testimonial-block.html';

type ContributionsABTest = ABTest & {
    epic: boolean,
    campaignId: string,
    campaignPrefix: string,
    campaignSuffix: string,
    useLocalViewLog: boolean,
    overrideCanRun: boolean,
    showToContributorsAndSupporters: boolean,
    pageCheck: (page: Object) => boolean,
    locations: Array<string>,
    locationCheck: (location: string) => boolean,
    useTargetingTool: boolean,
    insertEvent: string,
    viewEvent: string,
};

type EpicTemplate = (Variant, AcquisitionsEpicTemplateCopy) => string;

const membershipBaseURL = 'https://membership.theguardian.com/supporter';
const contributionsBaseURL = 'https://contribute.theguardian.com';

const lastContributionDate = getCookie('gu.contributions.contrib-timestamp');

/**
 * How many times the user can see the Epic, e.g. 6 times within 7 days with minimum of 1 day in between views.
 * @type {{days: number, count: number, minDaysBetweenViews: number}}
 */
const defaultMaxViews = {
    days: 30,
    count: 4,
    minDaysBetweenViews: 0,
};

const controlTemplate: EpicTemplate = (variant, copy) =>
    template(acquisitionsEpicControlTemplate, {
        copy,
        membershipUrl: variant.options && variant.options.membershipURL,
        contributionUrl: variant.options && variant.options.contributeURL,
        componentName: variant.options && variant.options.componentName,
        testimonialBlock: variant.options && variant.options.testimonialBlock,
    });

const doTagsMatch = (test: ContributionsABTest): boolean =>
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
    template(acquisitionsTestimonialBlockTemplate, {
        quoteSvg: testimonialParameters.quoteSvg,
        testimonialMessage: testimonialParameters.testimonialMessage,
        testimonialName: testimonialParameters.testimonialName,
        citeImage,
    });

const defaultPageCheck = (page: Object): boolean =>
    page.contentType === 'Article' && !page.isMinuteArticle;

const defaultCanEpicBeDisplayed = (test: ContributionsABTest): boolean => {
    const canReasonablyAskForMoney =
        test.showToContributorsAndSupporters ||
        commercialFeatures.canReasonablyAskForMoney;

    const worksWellWithPageTemplate = test.pageCheck(config.page);

    const storedGeolocation = geolocationGetSync();
    const inCompatibleLocation = test.locations.length
        ? test.locations.some(geo => geo === storedGeolocation)
        : true;

    const tagsMatch = doTagsMatch(test);

    return (
        canReasonablyAskForMoney &&
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

    return new Promise(resolve => resolve(acquisitionsCopyControl));
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
        REFPVID: (config.ophan && config.ophan.pageViewId) || 'not_found',
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
                // Apparently I need a comment here to satisfy the linter
                // TODO: change linter rule??
            }
        }
    });
};

const makeABTestVariant = (
    options: Object,
    parentTest: ContributionsABTest
): Variant => {
    const trackingCampaignId = parentTest.epic
        ? `epic_${parentTest.campaignId}`
        : parentTest.campaignId;
    const campaignCode = getCampaignCode(
        parentTest.campaignPrefix,
        parentTest.campaignId,
        options.id,
        parentTest.campaignSuffix
    );
    const iframeId = `${parentTest.campaignId}_iframe`;

    const {
        id,

        // optional params
        maxViews = defaultMaxViews,
        isUnlimited = false,
        contributeURL = addTrackingCodesToUrl(
            contributionsBaseURL,
            campaignCode
        ),
        membershipURL = addTrackingCodesToUrl(membershipBaseURL, campaignCode),
        templateFunction = controlTemplate,
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
        impression = submitImpression =>
            mediator.once(parentTest.insertEvent, submitImpression),
        success = submitSuccess =>
            mediator.once(parentTest.viewEvent, submitSuccess),
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
            campaignCode,
            contributeURL,
            membershipURL,
            template: templateFunction,
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

                                mediator.emit(
                                    parentTest.insertEvent,
                                    component
                                );
                                onInsert(component);

                                component.each(element => {
                                    // top offset of 18 ensures view only counts when half of element is on screen
                                    const elementInView = ElementInView(
                                        element,
                                        window,
                                        {
                                            top: 18,
                                        }
                                    );

                                    elementInView.on('firstview', () => {
                                        logView(parentTest.id);
                                        mediator.emit(parentTest.viewEvent);
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

const makeABTest = (options: Object): ContributionsABTest => {
    const {
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
        epic = true,
        showForSensitive = false,
        // locations is a filter where empty is taken to mean 'all'
        locations = [],
        locationCheck = () => true,
        dataLinkNames = '',
        campaignPrefix = 'gdnwb_copts_memco',
        campaignSuffix = '',
        isEngagementBannerTest = false,
        useLocalViewLog = false,
        overrideCanRun = false,
        useTargetingTool = false,
        showToContributorsAndSupporters = false,
        canRun = () => true,
        pageCheck = defaultPageCheck,
    } = options;

    const test = {
        canRun() {
            if (overrideCanRun) {
                return doTagsMatch(this) && canRun();
            }

            const testCanRun = typeof canRun === 'function' ? canRun() : true;
            const canEpicBeDisplayed = defaultCanEpicBeDisplayed(this);

            return testCanRun && canEpicBeDisplayed;
        },
        insertEvent: makeEvent(id, 'insert'),
        viewEvent: makeEvent(id, 'view'),

        id,
        start,
        expiry,
        author,
        description,
        audience,
        audienceOffset,
        successMeasure,
        audienceCriteria,
        showForSensitive,
        idealOutcome,
        dataLinkNames,
        variants,
        isEngagementBannerTest,
        epic,
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

    test.variants = test.variants.map(variant =>
        makeABTestVariant(variant, test)
    );

    return test;
};

export {
    defaultCanEpicBeDisplayed,
    getTestimonialBlock,
    addTrackingCodesToUrl,
    makeABTest,
};

export const daysSinceLastContribution = daysSince(lastContributionDate);

export const isContributor = !!lastContributionDate;
