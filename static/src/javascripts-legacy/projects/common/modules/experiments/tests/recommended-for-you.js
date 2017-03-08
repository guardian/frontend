define([
    'bean',
    'fastdom',
    'Promise',
    'qwery',
    'lib/$',
    'lib/storage',
    'lib/config',
    'lib/template',
    'common/views/svg',
    'common/modules/onward/history',
    'lib/ajax',
    'raw-loader!common/views/experiments/recommended-for-you.html',
    'raw-loader!common/views/experiments/recommended-for-you-opt-in.html',
    'svg-loader!svgs/icon/profile-36.svg',
    'svg-loader!svgs/icon/arrow-right.svg',
    'svg-loader!svgs/icon/marque-36.svg',
    'lib/fetch-json',
    'ophan/ng'
], function (
    bean,
    fastdom,
    Promise,
    qwery,
    $,
    storage,
    config,
    template,
    svg,
    history,
    ajax,
    recommendedForYouTemplate,
    recommendedForYouOptInTemplate,
    profileIcon,
    rightArrowIcon,
    guardianLogo,
    fetchJson,
    ophan
) {
    return function () {
        this.id = 'RecommendedForYouRecommendations';
        this.start = '2017-01-17';
        this.expiry = '2017-04-05';
        this.author = 'David Furey';
        this.description = 'Add an extra container above Opinion on the home front with recommended content based on ' +
            'each users history.  Users in the test group are prompted to opt-in.  Recommendations are only fetched' +
            'if the user opts-in.';
        this.audience = 0.05;
        this.audienceOffset = 0.2;
        this.successMeasure = 'Visit frequency';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will visit more often';

        var endpoint = 'https://engine.mobile-aws.guardianapis.com/recommendations?format=content_ids';
        var cachedRecommendationsKey = 'gu.cachedRecommendations';
        var cachedRecommendationsEnabledKey = 'gu.recommendationsEnabled';
        var numberOfRecommendations = 4;

        var $opinionSection;
        var $recommendedForYouSection = null;

        this.canRun = function () {
            $opinionSection = $('#opinion');
            return config.page.contentType === 'Network Front' && $opinionSection.length;
        };

        this.variants = [
            {
                id: 'user-history',
                test: function () {
                    if (!hasGivenFeedback()) {
                        insertOnBoardingSection();
                    } else if (shouldShowRecommendations()) {
                        populateRecommendationsContainer();
                    }
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];

        function populateRecommendationsContainer() {
            var recommendations = storage.local.get(cachedRecommendationsKey);
            if (recommendations && new Date(recommendations.expiry) > new Date()) {
                insertSection(recommendations.items);
            } else {
                var promisedRecommendations = getRemoteRecommendationsIds().then(getCardsHtml);
                promisedRecommendations.then(cacheRecommendations);
                promisedRecommendations.then(insertSection);
            }
        }

        function getCardsHtml(items) {
            return Promise.all(items.map(getCardHtml));
        }

        function getCardHtml(id) {
            var endpoint = '/embed/contentcard/' + id + '.json';
            var request = fetchJson(endpoint, {
                type: 'json',
                method: 'get'
            });

            return request.then(function (body) {
                return {
                    html: body.html,
                    id: id
                }
            });
        }

        function getRemoteRecommendationsIds() {
            var reqBody = {
                'pageSize': numberOfRecommendations,
                'articles': history.test.getHistory().map(function (item) { return item[0]; })
            };

            var request = fetchJson(endpoint, {
                type: 'json',
                method: 'post',
                crossOrigin: true,
                body: JSON.stringify(reqBody),
                headers: { 'Content-Type': 'application/json' }
            });

            return request.then(function (body) {
                return body.content.slice(0, numberOfRecommendations).map(function (recommendation){
                    return recommendation.id;
                });
            });
        }

        function cacheRecommendations(items) {
            var expiry = new Date();
            expiry.setTime(expiry.getTime() + 21600000);
            storage.local.set(cachedRecommendationsKey,
                {
                    'expiry': expiry,
                    'items': items
                }
            );
        }

        function setupComponentAttentionTracking(trackingCode) {
            ophan.trackComponentAttention(trackingCode, $recommendedForYouSection[0]);
        }

        function insertSection(items) {
            var $oldSection = $recommendedForYouSection;

            $recommendedForYouSection = $.create(template(recommendedForYouTemplate, {
                profileIcon: svg(profileIcon.markup, ['rounded-icon', 'rfy-profile-icon', 'control__icon-wrapper']),
                items: items
            }));

            if ($oldSection != null) {
                return fastdom.write(function() {
                    $oldSection.replaceWith($recommendedForYouSection);
                    setupComponentAttentionTracking('recommended-for-you_user-history');
                });
            } else {
                return fastdom.write(function() {
                    $recommendedForYouSection.insertBefore($opinionSection);
                    setupComponentAttentionTracking('recommended-for-you_user-history');
                });
            }
        }

        function hasGivenFeedback() {
            return storage.local.get(cachedRecommendationsEnabledKey) != null;
        }

        function shouldShowRecommendations() {
            return !!storage.local.get(cachedRecommendationsEnabledKey);
        }

        function registerFeedback(showRecommendations) {
            storage.local.set(cachedRecommendationsEnabledKey, showRecommendations);
        }

        function createOptInTemplate() {
            return $.create(template(recommendedForYouOptInTemplate, {
                profileIcon: svg(profileIcon.markup, ['rounded-icon', 'rfy-profile-icon', 'control__icon-wrapper']),
                rightArrowIcon: svg(rightArrowIcon.markup, ['i-right']),
                guardianLogo: svg(guardianLogo.markup)
            }));
        }

        function registerOptInButtonHandlers(section) {
            bean.on($('.js-feedback-button-yes', section)[0], 'click', function () {
                registerFeedback(true);
                $('.js-feedback', section).html(
                    '<p>Your recommendations will be ready soon.</p>'
                );
                populateRecommendationsContainer();
            });

            bean.on($('.js-feedback-button-no', section)[0], 'click', function () {
                registerFeedback(false);
                section.remove();
            });
        }

        function insertOnBoardingSection() {
            $recommendedForYouSection = createOptInTemplate();

            return fastdom.write(function() {
                $recommendedForYouSection.insertBefore($opinionSection);
                registerOptInButtonHandlers($recommendedForYouSection);
                setupComponentAttentionTracking('recommended-for-you_user-history');
            });
        }
    };
});
