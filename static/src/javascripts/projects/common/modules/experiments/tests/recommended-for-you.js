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
    'inlineSvg!svgs/icon/marque-36'
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
    guardianLogo
) {
    return function () {
        this.id = 'RecommendedForYou';
        this.start = '2016-08-02';
        this.expiry = '2016-12-23';
        this.author = 'Joseph Smith';
        this.description = 'Add a personalised container to fronts';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Number of clicks to turn on this section';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will click to turn on this section';

        var $opinionSection;
        var $recommendedForYouSection;

        this.canRun = function () {
            $opinionSection = $('#opinion');
            return config.page.contentType === 'Network Front' && $opinionSection.length && !hasGivenFeedback();
        };

        var endpoint = "http://engine.mobile-aws.guardianapis.com/recommendations";

        function imageFromItem(item) {
            function imageFromTemplate(img) {
                return img.replace('#{width}', 220).replace('#{height}', 146).replace('#{quality}', 0.8)
            }
            if (item.headerImage) {
                return '<img src="' + imageFromTemplate(item.headerImage.urlTemplate) + '"/>';
            } else if (item.headerVideo) {
                return '<img src="' + imageFromTemplate(item.headerVideo.stillImage.urlTemplate) + '"/>';
            } else {
                return svg(guardianLogo);
            }
        }

        function getRecommendations(data) {
            var request = ajax({
                url: endpoint,
                type: 'json',
                method: 'post',
                crossOrigin: true,
                data: JSON.stringify(data),
                contentType: 'application/json'
            });
            request.then(function (resp) {
                var items = resp.content.slice(0, 4);
                for (var i = 0; i < items.length; i++) {
                    items[i].image = imageFromItem(items[i].item);
                }
                insertSection(
                    'We can recommend you a set of unique stories based on your reading history',
                    'user-history',
                    'Turn on',
                    items
                );
            });
            return request;
        }
        function hasGivenFeedback() {
            return !!storage.local.get('gu.hasGivenRecommendedForYouFeedback');
        }

        function registerFeedback() {
            storage.local.set('gu.hasGivenRecommendedForYouFeedback', true);
        }

        function bindButtonEvents() {
            $('.js-feedback-button-yes', $recommendedForYouSection[0]).each(function(el) {
                bean.on(el, 'click', function () {
                    $('.js-feedback', $recommendedForYouSection[0]).html(
                        '<p>' +
                            'Thanks for your interest in this feature. We’re currently still testing demand. ' +
                            'If enough of you like the idea, we’ll make it happen. Fingers crossed!' +
                        '</p>'
                    );
                    registerFeedback();
                });
            });

            $('.js-feedback-button-no', $recommendedForYouSection[0]).each(function(el) {
                bean.on(el, 'click', function () {
                    $recommendedForYouSection.remove();
                    registerFeedback();
                });
            });
        }

        function setupComponentAttentionTracking(trackingCode) {
            require(['ophan/ng'], function (ophan) {
                ophan.trackComponentAttention(trackingCode, $recommendedForYouSection[0]);
            });
        }

        function insertSection(description, variant, yesCta, items) {
            $recommendedForYouSection = $.create(template(recommendedForYouTemplate, {
                profileIcon: svg(profileIcon, ['rounded-icon', 'rfy-profile-icon', 'control__icon-wrapper']),
                guardianLogo: svg(guardianLogo),
                description: description,
                variant: variant,
                yesCta: yesCta,
                items: items
            }));

            return fastdom.write(function() {
                $recommendedForYouSection.insertBefore($opinionSection);
                setupComponentAttentionTracking('recommended-for-you_' + variant);
                bindButtonEvents();
                mediator.emit('recommended-for-you:insert');
            });
        }

        function success(complete) {
            mediator.on('recommended-for-you:insert', function() {
                $('.js-feedback-button', $recommendedForYouSection[0]).each(function(el) {
                    bean.on(el, 'click', function() {
                        complete();
                    });
                });
            });
        }

        this.variants = [
            {
                id: 'user-choice',
                test: function () {
                    getRecommendations({
                        'pageSize': 4,
                        'articles': history.test.getHistory().map(function(v) { return v[0] })
                    });
                },
                success: success
            },
            {
                id: 'user-history',
                test: function () {
                    getRecommendations({
                        'pageSize': 4,
                        'articles': history.test.getHistory().map(function(v) { return v[0] })
                    });
                },
                success: success
            }
        ];
    };
});
