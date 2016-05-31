define([
    'qwery',
    'common/utils/config',
    'common/utils/mediator'
], function (
    qwery,
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
            return (config.page.isFront && document.querySelector('.fc-item--has-video-main-media .js-video-play-button')) ||
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
                        mediator.on('ab:PlayVideoOnFronts:in-article-video-created', function (player) {
                            if (first) {
                                first = false;
                                player.play();
                                player.on('video:content:25', function () {
                                    complete();
                                });
                            }
                        });
                    }

                    // This is for the front page
                    qwery('.fc-item--has-video-main-media').forEach(function (el) {
                        var link = el.querySelector('.u-faux-block-link__overlay');
                        var playButton = el.querySelector('.js-video-play-button');

                        if (playButton) {
                            link.href = link.href + autoplayHash;
                            playButton.addEventListener('click', function (ev) {
                                ev.preventDefault();
                                ev.stopPropagation();
                                link.click();
                                return false;
                            });
                        }
                    });
                }
            }
        ];
    };
});
