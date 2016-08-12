define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
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
            return config.page.isFront && config.page.contentType === 'Network Front' && $opinionSection.length;
        };

        function insertSection(description, variant) {
            $recommendedForYouSection = $.create(template(recommendedForYouTemplate, {
                profileIcon: svg(profileIcon, ['rounded-icon', 'rfy-profile-icon', 'control__icon-wrapper']),
                rightArrowIcon: svg(rightArrowIcon, ['i-right']),
                guardianLogo: svg(guardianLogo),
                description: description,
                variant: variant
            }));

            return fastdom.write(function() {
                $recommendedForYouSection.insertBefore($opinionSection);

                $('.js-feedback-button-yes', $recommendedForYouSection[0]).each(function(el) {
                    bean.on(el, 'click', function () {
                        $('.js-feedback', $recommendedForYouSection[0]).html(
                            '<p>' +
                                'Thanks for your interest in this feature. We’re currently still testing demand. ' +
                                'If enough of you like the idea, we’ll make it happen. Fingers crossed!' +
                            '</p>'
                        );
                    });
                });

                $('.js-feedback-button-no', $recommendedForYouSection[0]).each(function(el) {
                    bean.on(el, 'click', function () {
                        $recommendedForYouSection.remove();
                    });
                });

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
                    insertSection('Tell us what you’re interested in and we’ll recommend you a set of unique stories', 'user-choice');
                },
                success: success
            },
            {
                id: 'user-history',
                test: function () {
                    insertSection('We can recommend you a set of unique stories based on your reading history', 'user-history');
                },
                success: success
            }
        ];
    };
});
