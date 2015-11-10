/*eslint-disable no-new*/
/** Bootstrap for functionality common to all trail pages: article, live blogs, podcasts, videos, etc. */
define([
    'enhancer',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/contains',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/proximity-loader',
    'common/utils/detect',
    'common/modules/commercial/comment-adverts',
    'common/modules/discussion/loader',
    'common/modules/identity/api',
    'common/modules/onward/onward-content',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/tonal',
    'common/modules/social/share-count',
    'common/modules/onward/inject-container',
    'common/modules/experiments/ab',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp-api'
], function (
    enhancer,
    fastdom,
    qwery,
    _,
    $,
    config,
    contains,
    mediator,
    robust,
    proximityLoader,
    detect,
    commentAdverts,
    DiscussionLoader,
    identityApi,
    Onward,
    Popular,
    Related,
    TonalComponent,
    shareCount,
    injectContainer,
    ab,
    createAdSlot,
    commercialFeatures,
    dfp
) {
    function insertOrProximity(selector, insert) {
        if (window.location.hash) {
            insert();
        } else {
            var el = qwery(selector)[0];

            if (el) {
                proximityLoader.add(el, 1500, insert);
            }
        }
    }

    function initPopular() {
        if (!config.page.isFront) {
            insertOrProximity('.js-popular-trails', function () {
                new Popular().init();
            });
        }
    }

    function initRelated() {
        if (!(config.page.seriesId || config.page.blogIds)) {
            insertOrProximity('.js-related', function () {
                var opts = {
                    excludeTags: []
                };

                // exclude ad features from non-ad feature content
                if (config.page.sponsorshipType !== 'advertisement-features') {
                    opts.excludeTags.push('tone/advertisement-features');
                }
                // don't want to show professional network content on videos or interactives
                if ('contentType' in config.page &&
                    contains(['video', 'interactive'], config.page.contentType.toLowerCase())) {
                    opts.excludeTags.push('guardian-professional/guardian-professional');
                }
                new Related(opts).renderRelatedComponent();
            });
        }

        if (ab.getParticipations().InjectNetworkFrontTest && ab.getParticipations().InjectNetworkFrontTest.variant === 'variant' && ab.testCanBeRun('InjectNetworkFrontTest')) {
            var frontUrl;

            switch (config.page.edition) {
                case 'UK':
                    frontUrl = '/uk.json';
                    break;
                case 'US':
                    frontUrl = '/us.json';
                    break;
                case 'AU':
                    frontUrl = '/au.json';
                    break;
                case 'INT':
                    frontUrl = '/international.json';
                    break;
            }

            if (config.page.seriesId || config.page.blogIds) {
                $('.onward').insertBefore(qwery('.js-related'));
            }

            injectContainer.injectContainer(frontUrl, '.related', 'ab-network-front-loaded');

            mediator.once('ab-network-front-loaded', function () {
                var $parent = $('.facia-page');
                $parent.addClass('ab-front-injected');
                $parent.attr('data-link-name', $parent.attr('data-link-name') + ' | ab-front-injected');

                if (commercialFeatures.popularContentMPU && !(detect.getBreakpoint() === 'mobile' && $('.ad-slot--inline').length > 1)) {
                    var $mpuEl = $('#most-popular .js-fc-slice-mpu-candidate', this.elem);
                    this.$mpu = $mpuEl.append(createAdSlot('mostpop', 'container-inline'));
                } else {
                    this.$mpu = undefined;
                }

                if (this.$mpu) {
                    dfp.addSlot($('#most-popular .ad-slot', this.$mpu));
                    this.$mpu.removeClass('fc-slice__item--no-mpu');
                }

                $('.js-tabs-content', $parent).addClass('tabs__content--no-border');
                $('.js-tabs', $parent).addClass('u-h');
                mediator.emit('modules:popular:loaded', this.elem);
            }.bind(this));
        }
    }

    function initOnwardContent() {
        insertOrProximity('.js-onward', function () {
            if ((config.page.seriesId || config.page.blogIds) && config.page.showRelatedContent) {
                new Onward(qwery('.js-onward'));
            } else if (config.page.tones !== '') {
                $('.js-onward').each(function (c) {
                    new TonalComponent().fetch(c, 'html');
                });
            }
        });
    }

    function initDiscussion() {
        if (config.switches.discussion && config.page.commentable) {
            var el = qwery('.discussion')[0];
            if (el) {
                new DiscussionLoader().attachTo(el);
            }
        }
    }

    function augmentInteractive() {
        if (/Article|Interactive|LiveBlog/.test(config.page.contentType)) {
            $('figure.interactive').each(function (el) {
                fastdom.defer(function () {
                    enhancer.render(el, document, config, mediator);
                });
            });
        }
    }

    function repositionComments() {
        if (!identityApi.isUserLoggedIn()) {
            fastdom.write(function () {
                $('.js-comments').appendTo(qwery('.js-repositioned-comments'));
            });
        }
    }

    return function () {
        robust.catchErrorsAndLogAll([
            ['c-discussion', initDiscussion],
            ['c-comments', repositionComments],
            ['c-enhance', augmentInteractive],
            ['c-shares', shareCount],
            ['c-popular', initPopular],
            ['c-related', initRelated],
            ['c-onward', initOnwardContent],
            ['c-comment-adverts', commentAdverts]
        ]);
    };
});
