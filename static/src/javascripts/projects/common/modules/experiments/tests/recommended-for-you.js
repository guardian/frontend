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
    recommendedForYouTemplate,
    profileIcon,
    rightArrowIcon,
    guardianLogo
) {
    return function () {
        this.id = 'RecommendedForYou';
        this.start = '2016-08-02';
        this.expiry = '2016-09-09';
        this.author = 'Joseph Smith';
        this.description = 'Add a personalised container to fronts';
        this.audience = 0.1;
        this.audienceOffset = 0.1;
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

        function insertSection(description, variant, yesCta) {
            $recommendedForYouSection = $.create(template(recommendedForYouTemplate, {
                profileIcon: svg(profileIcon, ['rounded-icon', 'rfy-profile-icon', 'control__icon-wrapper']),
                guardianLogo: svg(guardianLogo),
                description: description,
                variant: variant,
                yesCta: yesCta
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
                    insertSection(
                        'Tell us what you’re interested in and we’ll recommend you a set of unique stories',
                        'user-choice',
                        'Get started ' + svg(rightArrowIcon, ['i-right'])
                    );
                },
                success: success
            },
            {
                id: 'user-history',
                test: function () {
                    insertSection(
                        'We can recommend you a set of unique stories based on your reading history',
                        'user-history',
                        'Turn on'
                    );
                },
                success: success
            }
        ];
    };
});
