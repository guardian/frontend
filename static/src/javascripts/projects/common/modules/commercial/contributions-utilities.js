// @flow
import { commercialFeatures } from 'commercial/modules/commercial-features';
import targetingTool from 'common/modules/commercial/targeting-tool';
import {
    regulars as acquisitionsCopyRegulars,
    control as acquisitionsCopyControl,
} from 'common/modules/commercial/acquisitions-copy';
import { control as acquisitionsTestimonialParametersControl } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
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

const doTagsMatch = options =>
    options.useTargetingTool ? targetingTool.isAbTestTargeted(options) : true;

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

const getTestimonialBlock = (testimonialParameters, citeImage) =>
    template(acquisitionsTestimonialBlockTemplate, {
        quoteSvg: testimonialParameters.quoteSvg,
        testimonialMessage: testimonialParameters.testimonialMessage,
        testimonialName: testimonialParameters.testimonialName,
        citeImage,
    });

const defaultCanEpicBeDisplayed = testConfig => {
    const canReasonablyAskForMoney =
        testConfig.showToContributorsAndSupporters ||
        commercialFeatures.commercialFeatures.canReasonablyAskForMoney;

    const worksWellWithPageTemplate = typeof testConfig.pageCheck === 'function'
        ? testConfig.pageCheck(config.page)
        : config.page.contentType === 'Article' && !config.page.isMinuteArticle;

    const storedGeolocation = geolocationGetSync();
    const inCompatibleLocation = testConfig.locations
        ? testConfig.locations.some(geo => geo === storedGeolocation)
        : true;
    const locationCheck = typeof testConfig.locationCheck === 'function'
        ? testConfig.locationCheck(storedGeolocation)
        : true;

    const tagsMatch = doTagsMatch(testConfig);

    return (
        canReasonablyAskForMoney &&
        worksWellWithPageTemplate &&
        inCompatibleLocation &&
        locationCheck &&
        tagsMatch
    );
};

const getCopy = useTailor => {
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

class ContributionsABTestVariant {
    constructor(options, test) {
        const trackingCampaignId = test.epic
            ? `epic_${test.campaignId}`
            : test.campaignId;
        const campaignCode = getCampaignCode(
            test.campaignPrefix,
            test.campaignId,
            options.id,
            test.campaignSuffix
        );

        this.id = options.id;

        this.options = {
            maxViews: options.maxViews || maxViews,
            isUnlimited: options.isUnlimited || false,
            campaignCode,
            campaignCodes: [campaignCode],
            contributeURL:
                options.contributeURL ||
                    this.getURL(contributionsBaseURL, campaignCode),
            membershipURL:
                options.membershipURL ||
                    this.getURL(membershipBaseURL, campaignCode),
            componentName: `mem_acquisition_${trackingCampaignId}_${this.id}`,
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
        };

        this.test = function testFn() {
            const displayEpic = typeof options.canEpicBeDisplayed === 'function'
                ? options.canEpicBeDisplayed(test)
                : true;

            if (!displayEpic) {
                return;
            }

            const onInsert = options.onInsert || noop;
            const onView = options.onView || noop;

            const render = templateFn =>
                getCopy(options.useTailoredCopyForRegulars)
                    .then(copy => {
                        const renderTemplate =
                            templateFn || this.options.template;
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

                                    elementInView.on(
                                        'firstview',
                                        function logElementInView() {
                                            logView(test.id);
                                            mediator.emit(test.viewEvent);
                                            mediator.emit(
                                                'register:end',
                                                trackingCampaignId
                                            );
                                            onView(this);
                                        }
                                    );
                                });
                            }
                        });
                    });

            return typeof options.test === 'function'
                ? options.test(render.bind(this), this, test)
                : render.apply(this);
        };

        this.registerIframeListener();
        this.registerListener(
            'impression',
            'impressionOnInsert',
            test.insertEvent,
            options
        );
        this.registerListener(
            'success',
            'successOnView',
            test.viewEvent,
            options
        );
    }

    static getURL(base, campaignCode) {
        const params = {
            REFPVID: (config.ophan && config.ophan.pageViewId) || 'not_found',
            INTCMP: campaignCode,
        };

        return `${base}?${constructURLQuery(params)}`;
    }

    contributionsURLBuilder(codeModifier) {
        return this.constructor.getURL(
            contributionsBaseURL,
            codeModifier(this.options.campaignCode)
        );
    }

    membershipURLBuilder(codeModifier) {
        return this.constructor.getURL(
            membershipBaseURL,
            codeModifier(this.options.campaignCode)
        );
    }

    registerListener(type, defaultFlag, event, options) {
        if (options[type]) this[type] = options[type];
        else if (options[defaultFlag]) {
            this[type] = track => mediator.on(event, track);
        }
    }

    registerIframeListener() {
        if (!this.options.usesIframe) return;

        window.addEventListener('message', message => {
            const iframe = document.getElementById(this.options.iframeId);

            if (iframe) {
                try {
                    const data = JSON.parse(message.data);

                    if (data.type === 'set-height' && data.value) {
                        iframe.style.height = `${data.value}px`;
                    }
                } catch (e) {
                    // Apparently I need a comment here to satisfy the linter
                }
            }
        });
    }
}

class ContributionsABTest {
    constructor(options) {
        this.id = options.id;
        this.epic = options.epic || true;
        this.start = options.start;
        this.expiry = options.expiry;
        this.author = options.author;
        this.idealOutcome = options.idealOutcome;
        this.campaignId = options.campaignId;
        this.description = options.description;
        this.showForSensitive = options.showForSensitive || false;
        this.audience = options.audience;
        this.audienceOffset = options.audienceOffset;
        this.successMeasure = options.successMeasure;
        this.audienceCriteria = options.audienceCriteria;
        this.dataLinkNames = options.dataLinkNames || '';
        this.campaignPrefix = options.campaignPrefix || 'gdnwb_copts_memco';
        this.campaignSuffix = options.campaignSuffix || '';
        this.insertEvent = this.makeEvent('insert');
        this.viewEvent = this.makeEvent('view');
        this.isEngagementBannerTest = options.isEngagementBannerTest || false;

        // Set useLocalViewLog to true if only the views for the respective test
        // should be used to determine variant viewability
        this.useLocalViewLog = options.useLocalViewLog || false;

        /**
         * Provides a default `canRun` function with typical rules (see function below) for Contributions messages.
         * If your test provides its own `canRun` option, it will be included in the check.
         *
         * You can alternatively use the `overrideCanRun` option, which, if true, will only use the `canRun`
         * option provided and ignore the rules here (except for the targeting tool tags check, which will still be
         * honoured if `useTargetingTool` is provided alongside `overrideCanRun`.
         *
         * @type {Function}
         */
        this.canRun = () => {
            if (options.overrideCanRun) {
                return doTagsMatch(options) && options.canRun();
            }

            const testCanRun = typeof options.canRun === 'function'
                ? options.canRun()
                : true;
            return testCanRun && defaultCanEpicBeDisplayed(options);
        };

        this.variants = options.variants.map(
            variant => new ContributionsABTestVariant(variant, this)
        );
    }

    makeEvent(event) {
        return `${this.id}:${event}`;
    }
}

// Utility function to build variants with common properties.
export const variantBuilderFactory = commonVariantProps => (id, variantProps) =>
    Object.assign(
        {},
        commonVariantProps,
        {
            id,
        },
        variantProps
    );

export { defaultCanEpicBeDisplayed, getTestimonialBlock };

export const daysSinceLastContribution = daysSince(lastContributionDate);

export const isContributor = !!lastContributionDate;

export const makeABTest = test =>
    // this is so it can be instantiated with `new` later
    () => new ContributionsABTest(test);
