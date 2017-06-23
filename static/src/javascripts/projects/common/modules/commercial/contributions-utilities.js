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
const maxViews = {
    days: 30,
    count: 4,
    minDaysBetweenViews: 0,
};

const controlTemplate = (variant, copy) =>
    template(acquisitionsEpicControlTemplate, {
        copy,
        membershipUrl: variant.options.membershipURL,
        contributionUrl: variant.options.contributeURL,
        componentName: variant.options.componentName,
        testimonialBlock: variant.options.testimonialBlock,
    });

const doTagsMatch = (campaignId: string, useTargetingTool: boolean) =>
    useTargetingTool ? targetingTool.isAbTestTargeted(campaignId) : true;

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

const defaultCanEpicBeDisplayed = (
    campaignId: string,
    showToContributorsAndSupporters: boolean,
    useTargetingTool: boolean,
    // TODO: it would be nice to have a type for page, as well as config.
    // set this default here as well as test factory so that this function is more usable externally
    pageCheck: (page: Object) => boolean = defaultPageCheck,
    locations: Array<string> = [],
    locationCheck: (location: string) => boolean = () => true
): boolean => {
    let canReasonablyAskForMoney = false;

    // This is really stupid but because commercialFeatures could be an empty object
    // if an error is thrown when initialising, flow doesn't like if I read from
    // commercialFeatures.canReasonablyAskForMoney outside of an if clause
    if (
        showToContributorsAndSupporters ||
        commercialFeatures.canReasonablyAskForMoney
    ) {
        canReasonablyAskForMoney = true;
    }

    const worksWellWithPageTemplate = pageCheck(config.page);

    const storedGeolocation = geolocationGetSync();
    const inCompatibleLocation = locations.length
        ? locations.some(geo => geo === storedGeolocation)
        : true;

    const tagsMatch = doTagsMatch(campaignId, useTargetingTool);

    return (
        canReasonablyAskForMoney &&
        worksWellWithPageTemplate &&
        inCompatibleLocation &&
        locationCheck(storedGeolocation) &&
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

const getURL = (base, campaignCode) => {
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
    test: ContributionsABTest
): Variant => {
    const trackingCampaignId = test.epic
        ? `epic_${test.campaignId}`
        : test.campaignId;
    const campaignCode = getCampaignCode(
        test.campaignPrefix,
        test.campaignId,
        options.id,
        test.campaignSuffix
    );

    if (options.usesIframe) {
        registerIframeListener(options.iframeId);
    }

    return {
        id: options.id,

        options: {
            maxViews: options.maxViews || maxViews,
            isUnlimited: options.isUnlimited || false,
            campaignCode,
            campaignCodes: [campaignCode],
            contributeURL:
                options.contributeURL ||
                    getURL(contributionsBaseURL, campaignCode),
            membershipURL:
                options.membershipURL ||
                    getURL(membershipBaseURL, campaignCode),
            componentName: `mem_acquisition_${trackingCampaignId}_${options.id}`,
            template: options.template || controlTemplate,
            testimonialBlock:
                options.testimonialBlock ||
                    getTestimonialBlock(
                        acquisitionsTestimonialParametersControl
                    ),
            blockEngagementBanner: options.blockEngagementBanner || false,
            engagementBannerParams: options.engagementBannerParams || {},
            isOutbrainCompliant: options.isOutbrainCompliant || false,
            usesIframe: options.usesIframe || false,
            iframeId: `${test.campaignId}_iframe`,
        },

        test() {
            const displayEpic = typeof options.canEpicBeDisplayed === 'function'
                ? options.canEpicBeDisplayed(test)
                : true;

            if (!displayEpic) {
                return;
            }

            const onInsert = options.onInsert || noop;
            const onView = options.onView || noop;

            const render = (templateFn: ?EpicTemplate) =>
                getCopy(options.useTailoredCopyForRegulars)
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
                            let targets = [];

                            if (!options.insertAtSelector) {
                                targets = getTargets('.submeta', false);
                            } else {
                                targets = getTargets(
                                    options.insertAtSelector,
                                    options.insertMultiple
                                );
                            }

                            if (targets.length > 0) {
                                if (options.insertAfter) {
                                    component.insertAfter(targets);
                                } else {
                                    component.insertBefore(targets);
                                }

                                mediator.emit(test.insertEvent, component);
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
                                        logView(test.id);
                                        mediator.emit(test.viewEvent);
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

            if (typeof options.test === 'function') {
                options.test(render.bind(this), this, test);
            } else {
                render.apply(this);
            }
        },

        impression:
            options.impression ||
                (submitImpression =>
                    mediator.once(test.insertEvent, submitImpression)),
        success:
            options.success ||
                (submitSuccess => mediator.once(test.viewEvent, submitSuccess)),

        contributionsURLBuilder(codeModifier) {
            return this.constructor.getURL(
                contributionsBaseURL,
                codeModifier(this.options.campaignCode)
            );
        },

        membershipURLBuilder(codeModifier) {
            return this.constructor.getURL(
                membershipBaseURL,
                codeModifier(this.options.campaignCode)
            );
        },
    };
};

const makeABTest = (options: Object): ContributionsABTest => {
    const {
        id,
        epic = true,
        start,
        expiry,
        author,
        idealOutcome,
        campaignId,
        description,
        showForSensitive = false,
        audience,
        audienceOffset,
        successMeasure,
        audienceCriteria,
        // should empty string defaults actually be optional?
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
        locations,
        locationCheck,
        variants,
    } = options;

    const test = {
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
        variants: variants.map(variant => makeABTestVariant(variant, test)),
        canRun: () => {
            if (overrideCanRun) {
                return (
                    doTagsMatch(campaignId, useTargetingTool) &&
                    options.canRun()
                );
            }

            const testCanRun = typeof canRun === 'function' ? canRun() : true;
            const canEpicBeDisplayed = defaultCanEpicBeDisplayed(
                campaignId,
                showToContributorsAndSupporters,
                useTargetingTool,
                pageCheck,
                locations,
                locationCheck
            );

            return testCanRun && canEpicBeDisplayed;
        },
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
        insertEvent: makeEvent(id, 'insert'),
        viewEvent: makeEvent(id, 'view'),
    };

    return test;
};

export { defaultCanEpicBeDisplayed, getTestimonialBlock, makeABTest };

export const daysSinceLastContribution = daysSince(lastContributionDate);

export const isContributor = !!lastContributionDate;
