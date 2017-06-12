define([
    'lodash/arrays/uniq',
    'commercial/modules/commercial-features',
    'common/modules/commercial/targeting-tool',
    'common/modules/commercial/acquisitions-copy',
    'common/modules/commercial/acquisitions-epic-testimonial-parameters',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/tailor/tailor',
    'lib/$',
    'lib/config',
    'lib/cookies',
    'lib/element-inview',
    'lib/fastdom-promise',
    'lib/mediator',
    'lib/storage',
    'lib/geolocation',
    'lib/url',
    'lib/noop',
    'lib/time-utils',
    'lodash/objects/assign',
    'lodash/utilities/template',
    'lodash/collections/toArray',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'raw-loader!common/views/acquisitions-epic-testimonial-block.html'
], function (
    uniq,
    commercialFeatures,
    targetingTool,
    acquisitionsCopy,
    acquisitionsTestimonialParameters,
    viewLog,
    tailor,
    $,
    config,
    cookies,
    ElementInView,
    fastdom,
    mediator,
    storage,
    geolocation,
    url,
    noop,
    timeUtils,
    assign,
    template,
    toArray,
    acquisitionsEpicControlTemplate,
    acquisitionsTestimonialBlockTemplate
) {

    var membershipBaseURL = 'https://membership.theguardian.com/supporter';
    var contributionsBaseURL = 'https://contribute.theguardian.com';

    var lastContributionDate = cookies.getCookie('gu.contributions.contrib-timestamp');

    var isContributor = !!lastContributionDate;

    /**
     * How many times the user can see the Epic, e.g. 6 times within 7 days with minimum of 1 day in between views.
     * @type {{days: number, count: number, minDaysBetweenViews: number}}
     */
    var maxViews = {
        days: 30,
        count: 4,
        minDaysBetweenViews: 0
    };

    var daysSinceLastContribution = timeUtils.daysSince(lastContributionDate);

    function controlTemplate(variant, copy) {
        return template(acquisitionsEpicControlTemplate, {
            copy: copy,
            membershipUrl: variant.options.membershipURL,
            contributionUrl: variant.options.contributeURL,
            componentName: variant.options.componentName,
            testimonialBlock: variant.options.testimonialBlock
        });
    }

    function doTagsMatch(options) {
        return options.useTargetingTool ? targetingTool.isAbTestTargeted(options) : true;
    }

    // Returns an array containing:
    // - the first element matching insertAtSelector, if isMultiple is false or not supplied
    // - all elements matching insertAtSelector, if isMultiple is true
    // - or an empty array if the selector doesn't match anything on the page
    function getTargets(insertAtSelector, isMultiple) {
        var els = document.querySelectorAll(insertAtSelector);

        if (isMultiple) {
            return toArray(els);
        } else if (els.length) {
            return [els[0]];
        }

        return [];
    }

    function getTestimonialBlock(testimonialParameters, citeImage){
        return template(acquisitionsTestimonialBlockTemplate, {
            quoteSvg: testimonialParameters.quoteSvg,
            testimonialMessage: testimonialParameters.testimonialMessage,
            testimonialName: testimonialParameters.testimonialName,
            citeImage: citeImage
        });
    }

    function defaultCanEpicBeDisplayed(testConfig) {
        var canReasonablyAskForMoney = testConfig.showToContributorsAndSupporters || commercialFeatures.commercialFeatures.canReasonablyAskForMoney;

        var worksWellWithPageTemplate = (typeof testConfig.pageCheck === 'function')
            ? testConfig.pageCheck(config.page)
            : config.page.contentType === 'Article' && !config.page.isMinuteArticle;

        var storedGeolocation = geolocation.getSync();
        var inCompatibleLocation = testConfig.locations ? testConfig.locations.some(function (geo) {
            return geo === storedGeolocation;
        }) : true;
        var locationCheck = (typeof testConfig.locationCheck === 'function') ? testConfig.locationCheck(storedGeolocation) : true;

        var tagsMatch = doTagsMatch(testConfig);

        return canReasonablyAskForMoney &&
            worksWellWithPageTemplate &&
            inCompatibleLocation &&
            locationCheck &&
            tagsMatch
    }

    function ContributionsABTest(options) {
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
        this.useLocalViewLog =  options.useLocalViewLog || false;

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
        this.canRun = (function () {
            if (options.overrideCanRun) {
                return doTagsMatch(options) && options.canRun();
            }

            var testCanRun = (typeof options.canRun === 'function') ? options.canRun() : true;
            return testCanRun && defaultCanEpicBeDisplayed(options);
        }).bind(this);

        this.variants = options.variants.map(function (variant) {
            return new ContributionsABTestVariant(variant, this);
        }.bind(this));
    }

    ContributionsABTest.prototype.makeEvent = function (event) {
        return this.id + ':' + event;
    };

    function getCopy(useTailor) {
        if (useTailor) {
            return tailor.isRegular().then(function (regular) {
                return regular ? acquisitionsCopy.regulars : acquisitionsCopy.control;
            })
        }

        return new Promise(function (resolve) {
            return resolve(acquisitionsCopy.control);
        });
    }

    function ContributionsABTestVariant(options, test) {
        var trackingCampaignId = test.epic ? 'epic_' + test.campaignId : test.campaignId;
        var campaignCode = getCampaignCode(test.campaignPrefix, test.campaignId, options.id, test.campaignSuffix);

        this.id = options.id;

        this.options = {
            maxViews: options.maxViews || maxViews,
            isUnlimited: options.isUnlimited || false,
            campaignCode: campaignCode,
            campaignCodes: [campaignCode],
            contributeURL: options.contributeURL || this.getURL(contributionsBaseURL, campaignCode),
            membershipURL: options.membershipURL || this.getURL(membershipBaseURL, campaignCode),
            componentName: 'mem_acquisition_' + trackingCampaignId + '_' + this.id,
            template: options.template || controlTemplate,
            testimonialBlock: options.testimonialBlock || getTestimonialBlock(acquisitionsTestimonialParameters.control),
            blockEngagementBanner: options.blockEngagementBanner || false,
            engagementBannerParams: options.engagementBannerParams || {},
            isOutbrainCompliant: options.isOutbrainCompliant || false,
            usesIframe: options.usesIframe || false,
            iframeId: test.campaignId + '_' + 'iframe',
        };

        this.test = function () {
            var displayEpic = (typeof options.canEpicBeDisplayed === 'function') ?
                options.canEpicBeDisplayed(test) : true;

            if (!displayEpic) {
                return;
            }

            var onInsert = options.onInsert || noop.noop;
            var onView = options.onView || noop.noop;

            function render(templateFn) {
                return getCopy(options.useTailoredCopyForRegulars).then(function (copy) {
                    var template = templateFn || this.options.template;
                    return template(this, copy);
                }.bind(this)).then(function(template) {
                    var component = $.create(template);

                    mediator.emit('register:begin', trackingCampaignId);

                    return fastdom.write(function () {
                        var targets = [];

                        if (!options.insertAtSelector) {
                            targets = getTargets('.submeta', false);
                        } else {
                            targets = getTargets(options.insertAtSelector, options.insertMultiple);
                        }

                        if (targets.length > 0) {
                            if (options.insertAfter) {
                                component.insertAfter(targets);
                            } else {
                                component.insertBefore(targets);
                            }

                            mediator.emit(test.insertEvent, component);
                            onInsert(component);

                            component.each(function (element) {
                                // top offset of 18 ensures view only counts when half of element is on screen
                                var elementInView = ElementInView(element, window, { top: 18 });

                                elementInView.on('firstview', function () {
                                    viewLog.logView(test.id);
                                    mediator.emit(test.viewEvent);
                                    mediator.emit('register:end', trackingCampaignId);
                                    onView(this);
                                });
                            });
                        }
                    }.bind(this));
                });
            }

            return (typeof options.test === 'function') ? options.test(render.bind(this), this, test) : render.apply(this);
        };

        this.registerIframeListener();
        this.registerListener('impression', 'impressionOnInsert', test.insertEvent, options);
        this.registerListener('success', 'successOnView', test.viewEvent, options);
    }

    function getCampaignCode(campaignCodePrefix, campaignID, id, campaignCodeSuffix) {
        var suffix = campaignCodeSuffix ? ('_' + campaignCodeSuffix) : '';
        return campaignCodePrefix + '_' + campaignID + '_' + id + suffix;
    }

    ContributionsABTestVariant.prototype.getURL = function(base, campaignCode) {
        var params = {
            REFPVID: (config.ophan && config.ophan.pageViewId) || 'not_found',
            INTCMP: campaignCode
        };

        return base + '?' + url.constructQuery(params);
    };

    ContributionsABTestVariant.prototype.contributionsURLBuilder = function(codeModifier) {
        return this.getURL(contributionsBaseURL, codeModifier(this.options.campaignCode));
    };

    ContributionsABTestVariant.prototype.membershipURLBuilder = function(codeModifier) {
        return this.getURL(membershipBaseURL, codeModifier(this.options.campaignCode));
    };

    ContributionsABTestVariant.prototype.registerListener = function (type, defaultFlag, event, options) {
        if (options[type]) this[type] = options[type];
        else if (options[defaultFlag]) {
            this[type] = (function (track) {
                return mediator.on(event, track);
            }).bind(this);
        }
    };

    ContributionsABTestVariant.prototype.registerIframeListener = function() {
        if (!this.options.usesIframe) return;

        window.addEventListener('message', function(message) {
            var iframe = document.getElementById(this.options.iframeId);

            if (iframe) {
                try {
                    var data = JSON.parse(message.data);

                    if (data.type === 'set-height' && data.value) {
                        iframe.style.height = data.value + 'px';
                    }
                } catch (e) {
                    return;
                }
            }
        }.bind(this));
    }

    // Utility function to build variants with common properties.
    function variantBuilderFactory(commonVariantProps) {
        return function(id, variantProps) {
            return assign({}, commonVariantProps, {id: id}, variantProps)
        }
    }

    return {
        defaultCanEpicBeDisplayed: defaultCanEpicBeDisplayed,
        makeABTest: function (test) {
            // this is so it can be instantiated with `new` later
            return function () {
                return new ContributionsABTest(test);
            };
        },
        getTestimonialBlock: getTestimonialBlock,
        variantBuilderFactory: variantBuilderFactory,
        daysSinceLastContribution: daysSinceLastContribution,
        isContributor: isContributor
    };
});
