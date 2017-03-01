define([
    'lodash/arrays/uniq',
    'commercial/modules/commercial-features',
    'common/modules/commercial/targeting-tool',
    'common/modules/commercial/acquisitions-view-log',
    'common/utils/$',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/element-inview',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/geolocation',
    'common/utils/template',
    'raw-loader!common/views/contributions-epic-equal-buttons.html'
], function (
    uniq,
    commercialFeatures,
    targetingTool,
    viewLog,
    $,
    config,
    cookies,
    ElementInView,
    fastdom,
    mediator,
    storage,
    geolocation,
    template,
    contributionsEpicEqualButtons
) {

    var membershipURL = 'https://membership.theguardian.com/supporter';
    var contributionsURL = 'https://contribute.theguardian.com';

    var lastContributionDate = cookies.get('gu.contributions.contrib-timestamp');

    /**
     * How many times the user can see the Epic, e.g. 6 times within 7 days.
     * @type {{days: number, count: number}}
     */
    var maxViews = {
        days: 7,
        count: 6,
        minDaysBetweenViews: 0
    };

    function daysSince(date) {
        var oneDay = 24 * 60 * 60 * 1000;

        try {
            var ms = Date.parse(date);

            if (isNaN(ms)) return Infinity;
            return (new Date() - ms) / oneDay;
        } catch(e) {
            return Infinity;
        }
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
        this.membershipCampaignPrefix = options.membershipCampaignPrefix || 'gdnwb_copts_mem';
        this.contributionsCampaignPrefix = options.contributionsCampaignPrefix || 'co_global';
        this.insertEvent = this.makeEvent('insert');
        this.viewEvent = this.makeEvent('view');

        /**
         * Provides a default `canRun` function with typical rules (see function below) for Contributions messages.
         * If your test provides its own `canRun` option, it will be included in the check.
         *
         * You can alternatively use the `overrideCanRun` option, which, if true, will only use the `canRun`
         * option provided and ignore the rules here (except for the targeting tool tags check, whcih will still be
         * honoured if `useTargetingTool` is provided alongside `overrideCanRun`.
         *
         * @type {Function}
         */
        this.canRun = (function () {
            var testCanRun = (typeof options.canRun === 'function') ? options.canRun() : true;
            var enoughTimeSinceLastContribution = daysSince(lastContributionDate) >= 90;
            var tagsMatch = options.useTargetingTool ? targetingTool.isAbTestTargeted(this) : true;
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle;
            var storedGeolocation = geolocation.getSync();
            var inCompatibleLocation = options.locations ? options.locations.some(function (geo) {
                return geo === storedGeolocation;
            }) : true;
            var locationCheck = (typeof options.locationCheck === 'function') ? options.locationCheck(storedGeolocation) : true;
            var isImmersive = config.page.isImmersive === true;

            if (options.overrideCanRun) return tagsMatch && options.canRun();

            return enoughTimeSinceLastContribution &&
                tagsMatch &&
                testCanRun &&
                worksWellWithPageTemplate &&
                commercialFeatures.canReasonablyAskForMoney &&
                (inCompatibleLocation && locationCheck) &&
                !isImmersive;
        }).bind(this);

        this.variants = options.variants.map(function (variant) {
            return new ContributionsABTestVariant(variant, this);
        }.bind(this));
    }

    ContributionsABTest.prototype.makeEvent = function (event) {
        return this.id + ':' + event;
    };

    function controlTemplate(membershipUrl, contributionUrl) {
        return template(contributionsEpicEqualButtons, {
            linkUrl1: membershipUrl,
            linkUrl2: contributionUrl,
            title: 'Since you’re here …',
            p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism open to all. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
            p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
            p3: '',
            cta1: 'Become a Supporter',
            cta2: 'Make a contribution'
        });
    }

    function ContributionsABTestVariant(options, test) {
        var trackingCampaignId = test.epic ? 'epic_' + test.campaignId : test.campaignId;

        this.campaignId = test.campaignId;
        this.id = options.id;
        this.maxViews = options.maxViews || maxViews;
        this.isUnlimited = options.isUnlimited || false;

        this.pageviewId = (config.ophan && config.ophan.pageViewId) || 'not_found';
        this.contributeCampaignCode = getCampaignCode(test.contributionsCampaignPrefix, this.campaignId, this.id);
        this.membershipCampaignCode = getCampaignCode(test.membershipCampaignPrefix, this.campaignId, this.id);
        this.campaignCodes = uniq([this.contributeCampaignCode, this.membershipCampaignCode]);

        this.contributeURL = options.contributeURL || this.makeURL(contributionsURL, this.contributeCampaignCode);
        this.membershipURL = options.membershipURL || this.makeURL(membershipURL, this.membershipCampaignCode);

        this.template = options.template || controlTemplate;

        this.test = function () {
            var component = $.create(this.template(this.membershipURL, this.contributeURL));
            var onInsert = options.onInsert || noop;
            var onView = options.onView || noop;

            function render() {
                mediator.emit('register:begin', trackingCampaignId);

                return fastdom.write(function () {
                    var selector = options.insertBeforeSelector || '.submeta';
                    var sibling = $(selector);

                    if (sibling.length > 0) {
                        component.insertBefore(sibling);
                        mediator.emit(test.insertEvent, component);
                        onInsert(component);

                        component.each(function (element) {
                            // top offset of 18 ensures view only counts when half of element is on screen
                            var elementInView = ElementInView(element, window, { top: 18 });

                            elementInView.on('firstview', function () {
                                viewLog.logView(test.id);
                                mediator.emit(test.viewEvent);
                                mediator.emit('register:end', trackingCampaignId);
                                onView();
                            });
                        });
                    }
                }.bind(this));
            }

            return (typeof options.test === 'function') ? options.test(render.bind(this)) : render.apply(this);
        };

        this.registerListener('impression', 'impressionOnInsert', test.insertEvent, options);
        this.registerListener('success', 'successOnView', test.viewEvent, options);
    }

    function getCampaignCode(campaignCodePrefix, campaignID, id) {
        return campaignCodePrefix + '_' + campaignID + '_' + id;
    }

    ContributionsABTestVariant.prototype.makeURL = function(base, campaignCode) {
        var params = [
            'INTCMP=' + campaignCode,
            'REFPVID=' + this.pageviewId
        ];

        return base + '?' + params.filter(Boolean).join('&');
    }

    ContributionsABTestVariant.prototype.registerListener = function (type, defaultFlag, event, options) {
        if (options[type]) this[type] = options[type];
        else if (options[defaultFlag]) {
            this[type] = (function (track) {
                return mediator.on(event, track);
            }).bind(this);
        }
    };

    function noop() {}

    return {
        makeABTest: function (test) {
            // this is so it can be instantiated with `new` later
            return function () {
                return new ContributionsABTest(test);
            };
        }
    };
});
