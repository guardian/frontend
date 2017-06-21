define(
    [
        'bonzo',
        'lib/$',
        'lib/mediator',
        'lodash/objects/assign',
        'lib/config',
        'common/modules/identity/api',
        'lodash/functions/debounce',
    ],
    function(bonzo, $, mediator, assign, config, Id, debounce) {
        /**
     * event51: Comment
     * event72: Engagement event (e.g. recommendation)
     * eVar65: Only for event72. Type of interaction (any string)
     * eVar66: User ID of current user
     * eVar67: User ID of person being acted upon
     * eVar68: Only for event51. comment || response
     */
        var track = {};
        track.seen = false;

        var gaTracker = config.googleAnalytics.trackers.editorial;

        function sendToGA(label, customDimensions) {
            var fieldsObject = assign(
                {
                    nonInteraction: true, // to avoid affecting bounce rate
                },
                customDimensions || {}
            );
            window.ga(
                gaTracker + '.send',
                'event',
                'element view',
                'onpage item',
                label,
                fieldsObject
            );
        }

        track.jumpedToComments = function() {
            if (!track.seen) {
                track.seen = true;
            }
        };

        track.commentPermalink = function() {
            if (!track.seen) {
                track.seen = true;
            }
        };

        track.scrolledToComments = function() {
            if (!track.seen) {
                sendToGA('scroll to comments');
                track.seen = true;
            }
        };

        // Convenience functions
        track.areCommentsSeen = function() {
            var timer,
                scroll = function() {
                    if (!track.seen && !timer && track.areCommentsVisible()) {
                        track.scrolledToComments();
                        mediator.off(
                            'window:throttledScroll',
                            debounce(scroll, 200)
                        );
                    }
                };

            if (!track.seen) {
                mediator.on('window:throttledScroll', debounce(scroll, 200));
            }
        };

        track.areCommentsVisible = function() {
            var comments = $('#comments').offset(),
                scrollTop = window.pageYOffset,
                viewport = bonzo.viewport().height;

            if (
                comments.top - viewport / 2 < scrollTop &&
                comments.top + comments.height - viewport / 3 > scrollTop
            ) {
                return true;
            } else {
                return false;
            }
        };

        return {
            init: function() {
                mediator.on(
                    'discussion:seen:comment-permalink',
                    track.commentPermalink.bind(track)
                );
                mediator.on(
                    'discussion:seen:comments-anchor',
                    track.jumpedToComments.bind(track)
                );
                mediator.on(
                    'discussion:seen:comments-scrolled-to',
                    track.scrolledToComments.bind(track)
                );

                track.areCommentsSeen();
            },
        };
    }
); // define
