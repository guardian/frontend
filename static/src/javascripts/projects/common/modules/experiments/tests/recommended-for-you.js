define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/storage',
    'common/utils/config',
    'common/utils/template',
    'common/views/svg',
    'common/utils/mediator',
    'common/modules/onward/history',
    'common/utils/ajax',
    'text!common/views/experiments/recommended-for-you.html',
    'inlineSvg!svgs/icon/profile-36',
    'inlineSvg!svgs/icon/arrow-right',
    'inlineSvg!svgs/icon/marque-36',
    'common/utils/fetch'
], function (
    bean,
    fastdom,
    qwery,
    $,
    storage,
    config,
    template,
    svg,
    mediator,
    history,
    ajax,
    recommendedForYouTemplate,
    profileIcon,
    rightArrowIcon,
    fetch
) {
    return function () {
        this.id = 'RecommendedForYouRecommendations';
        this.start = '2016-08-02';
        this.expiry = '2017-01-21';
        this.author = 'Joseph Smith';
        this.description = 'Add a personalised container to fronts';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Visit frequency';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will visit more often';

        var endpoint = 'https://engine.mobile-aws.guardianapis.com/recommendations?format=content_ids';
        var cachedRecommendationsKey = 'gu.cachedRecommendations';
        var numberOfRecommendations = 4;

        var $opinionSection;
        var $recommendedForYouSection;

        this.canRun = function () {
            $opinionSection = $('#opinion');
            return config.page.contentType === 'Network Front' && $opinionSection.length;
        };

        this.variants = [
            {
                id: 'user-history',
                test: function () {
                    populateRecommendationsContainer();
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
                var promisedRecommendations = getRemoteRecommendations().then(getCardsHtml);
                promisedRecommendations.then(cacheRecommendations);
                promisedRecommendations.then(insertSection);
            }
        }

        function getCardsHtml(items) {
            return Promise.all(items.forEach(getCardHtml));
        }

        function getCardHtml(item) {
            var endpoint = '/embed/contentcard/' + item.item.id + '.json';
            var request = fetch(endpoint, {
                type: 'json',
                method: 'get'
            });

            return request.then(function (response) {
                return response.json().then(function (body) {
                    return {
                        html: body.html,
                        id: item.item.id
                    }
                });
            });
        }

        function getRemoteRecommendations() {
            var reqBody = {
                'pageSize': numberOfRecommendations,
                'articles': history.test.getHistory().map(function (item) { return item[0]; })
            };

            var request = fetch(endpoint, {
                type: 'json',
                method: 'post',
                crossOrigin: true,
                body: JSON.stringify(reqBody),
                headers: { 'Content-Type': 'application/json' }
            });

            return request.then(function (response) {
                return response.json().then(function (body) { return body.content.slice(0, numberOfRecommendations); });
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
            require(['ophan/ng'], function (ophan) {
                ophan.trackComponentAttention(trackingCode, $recommendedForYouSection[0]);
            });
        }

        function insertSection(items) {

            $recommendedForYouSection = $.create(template(recommendedForYouTemplate, {
                profileIcon: svg(profileIcon, ['rounded-icon', 'rfy-profile-icon', 'control__icon-wrapper']),
                items: items
            }));

            return fastdom.write(function() {
                $recommendedForYouSection.insertBefore($opinionSection);
                setupComponentAttentionTracking('recommended-for-you_user-history');
                mediator.emit('recommended-for-you:insert');
            });
        }
    };
});
