define([
    'bean',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator'
], function (
    bean,
    $,
    config,
    mediator
) {
    var autoplayHash = '#autoplay-main-media';
    var hasAutoplayHash = window.location.hash.match(autoplayHash);

    return function () {
        this.id = 'PlayVideoOnFronts';
        this.start = '2016-05-24';
        this.expiry = '2016-05-31';
        this.author = 'James Gorrie';
        this.description = 'Test if autoplaying on fronts is bad.';
        this.audience = 0.5;
        this.audienceOffset = 0.39;
        this.successMeasure = '';
        this.audienceCriteria = 'Fronts that have cards with articles that have video as their main media';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            // Only videos that are links to video pages have data-embed-paths
            // Or article pages that have been linked to from test-enhanced cards
            return (config.page.isFront && $('.fc-item--has-video-main-media .js-video-play-button').length > 0) ||
                (config.page.contentType === 'Article' && hasAutoplayHash);
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function(complete) {
                    mediator.on('ab:PlayVideoOnFronts:front-player-created', function(player) {
                        player.on('video:content:25', function() {
                            complete();
                        });
                    });
                }
            },
            {
                id: 'variant1',
                test: function () {},
                success: function(complete) {
                    // On article page
                    if (hasAutoplayHash) {
                        var first = true;
                        mediator.on('ab:PlayVideoOnFronts:in-article-video-created', function(player) {
                            if (first) {
                                first = false;
                                player.play();
                                player.on('video:content:25', function() {
                                    complete();
                                });
                            }
                        });
                    }

                    // This is for the front page
                    $('.fc-item--has-video-main-media').each(function(el) {
                        var link = $('.u-faux-block-link__overlay', el);
                        var playButton = $('.js-video-play-button', el);

                        if (playButton.length > 0) {
                            link.attr('href', link.attr('href') + autoplayHash);

                            bean.on(playButton[0], 'click', function(ev) {
                                ev.preventDefault();
                                ev.stopPropagation();
                                link[0].click();
                                return false;
                            });
                        }
                    });
                }
            }
        ];
    };
});
