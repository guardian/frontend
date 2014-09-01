define([
    'common/utils/mediator',
    'common/utils/$',
    'qwery',
    'bonzo',
    'bean',
    'lodash/functions/throttle',
    'common/utils/_',
    'common/utils/scroller',
    'common/utils/detect',
    'common/modules/ui/autoupdate',
    'common/modules/live/filter',
    'common/modules/ui/notification-counter',
    'common/modules/experiments/affix',
    'common/utils/template',
    'common/utils/url',
    'common/bootstraps/article',
    'common/modules/ui/message',
    'common/utils/preferences'
], function (
    mediator,
    $,
    qwery,
    bonzo,
    bean,
    _throttle,
    _,
    scroller,
    detect,
    AutoUpdate,
    LiveFilter,
    NotificationCounter,
    Affix,
    template,
    url,
    article,
    Message,
    preferences
) {
    'use strict';

    var affix = null;
    var autoUpdate = null;

    function getKeyEvents() {
        return qwery('.is-key-event').slice(0, 7);
    }

    function getBlocks() {
        return qwery('.block');
    }

    function getFirstBlock() {
        return getBlocks().shift();
    }

    function getLastBlock() {
        return getBlocks().pop();
    }

    function createScrollTransitions (){

        var selectedClass = 'live-blog__key-event--selected';

        function unselect() {
            $('.'+selectedClass).removeClass(selectedClass);
        }

        var curBinding;
        function unselectOnScroll() {
            bean.off(curBinding);
            curBinding = bean.one(document, 'scroll', function() { unselect(); });
        }

        bean.on(qwery('.timeline')[0], 'click', '.timeline__link', function(e) {
            mediator.emit('module:liveblog:showkeyevents', true);
            $('.dropdown--live-feed').addClass('dropdown--active');
            var $el = bonzo(e.currentTarget),
                eventId = $el.attr('data-event-id'),
                title = $('.timeline__title', $el).text(),
                targetEl = qwery('#'+eventId),
                dim = bonzo(targetEl).offset();
            scroller.scrollTo(dim.top, 500, 'easeOutQuint');
            window.setTimeout(unselectOnScroll, 550);
            bean.off(curBinding);
            unselect();
            $el.addClass(selectedClass);
            url.pushUrl({blockId: eventId}, title, window.location.pathname + '#' + eventId, true);
            e.stop();
        });
    }

    function createKeyEventHTML(el) {
        var keyEventTemplate = '<li class="timeline__item" data-event-id="{{id}}">' +
            '<a class="timeline__link" href="#{{id}}" data-event-id="{{id}}">' +
            '<span class="timeline__date">{{time}}</span><span class="timeline__title u-underline">{{title}}</span></a></li>';

        var data = {
            id: el.getAttribute('id'),
            title: $('.block-title', el).text(),
            time: $('.block-time__link', el).html()
        };

        return template(keyEventTemplate, data);
    }

    function getTimelineHTML(events) {
        var remaining;
        function recursiveRender(events, html) {
            if (events.length) { // key event at 0 index
                html += createKeyEventHTML(events[0]);
                remaining = events.slice(1);
            } else { // no events left
                return html;
            }
            return recursiveRender(remaining, html);
        }

        return recursiveRender(events, '');
    }

    function wrapWithFirstAndLast(html) {
        return createKeyEventHTML(getFirstBlock()) + html + createKeyEventHTML(getLastBlock());
    }

    function getUpdatePath() {
        var blocks = qwery('.article-body .block'),
            newestBlock = null;

        if (autoUpdate.getManipulationType() === 'append') {
            newestBlock = blocks.pop();
        } else {
            newestBlock = blocks.shift();
        }

        // There may be no blocks at all. 'block-0' will return any new blocks found.
        var id = newestBlock ? newestBlock.id : 'block-0';
        return window.location.pathname + '.json?lastUpdate=' + id;
    }

    var modules = {

        createFilter: function() {
            new LiveFilter($('.js-blog-blocks')[0]).render($('.js-live-filter')[0]);
            new NotificationCounter().init();
        },

        createTimeline: function(config) {
            var allEvents = getKeyEvents();
            if(allEvents.length > 0) {
                var timelineHTML = wrapWithFirstAndLast(getTimelineHTML(allEvents));

                $('.js-live-blog__timeline').append(timelineHTML);
                $('.js-live-blog__timeline li:first-child .timeline__title').text('Latest post');
                $('.js-live-blog__timeline li:last-child .timeline__title').text('Opening post');

                if (/desktop|wide/.test(detect.getBreakpoint()) && config.page.keywordIds.indexOf('football/football') < 0) {
                    var topMarker = qwery('.js-top-marker')[0];
                    affix = new Affix({
                        element: qwery('.js-live-blog__timeline-container')[0],
                        topMarker: topMarker,
                        bottomMarker: qwery('.js-bottom-marker')[0],
                        containerElement: qwery('.js-live-blog__key-events')[0]
                    });
                }
                createScrollTransitions();
            }
        },

        createAutoRefresh: function(config){

            if (config.page.isLive) {

                var timerDelay = /desktop|wide/.test(detect.getBreakpoint()) ? 30000 : 60000;
                autoUpdate = new AutoUpdate({
                    path: getUpdatePath,
                    delay: timerDelay,
                    attachTo: $('.article-body')[0],
                    switches: config.switches,
                    manipulationType: 'prepend'
                });
                autoUpdate.init();
            }

            mediator.on('module:filter:toggle', function(orderedByOldest) {
                if (!autoUpdate) {
                    return;
                }
                if (orderedByOldest) {
                    autoUpdate.setManipulationType('append');
                } else {
                    autoUpdate.setManipulationType('prepend');
                }
            });
        },

        showFootballLiveBlogMessage: function(config){
            var isFootballLiveBlog = config.page.pageId.indexOf('football/live/') === 0;
            var notMobile = detect.getBreakpoint() !== 'mobile';

            if (isFootballLiveBlog && notMobile && !preferences.hasOptedIntoResponsive()) {

                var msg = '<p class="site-message__message" id="site-message__message">' +
                    'We’ve redesigned our Football live blogs to make it easier to follow the match. We’d love to hear what you think.' +
                    '</p>' +
                    '<ul class="site-message__actions u-unstyled">' +
                    '<li class="site-message__actions__item">' +
                    '<i class="i i-arrow-white-right"></i>' +
                    '<a href="https://www.surveymonkey.com/s/guardianliveblogs_football" target="_blank">Leave feedback</a>' +
                    '</li>' +
                    '<li class="site-message__actions__item">' +
                    '<i class="i i-arrow-white-right"></i>' +
                    '<a href="http://next.theguardian.com" target="_blank">Find out more</a>' +
                    '</li>' +
                    '</ul>';

                var releaseMessage = new Message('football-live-blog', {pinOnHide: true});

                releaseMessage.show(msg);
            }
        }
    };

    function ready(config, context) {
        modules.createFilter(config, context);
        modules.createTimeline(config, context);
        modules.createAutoRefresh(config, context);
        modules.showFootballLiveBlogMessage(config, context);

        // re-use modules from article bootstrap
        article.modules.initOpen(config, context);
        article.modules.initFence();
        article.modules.initTruncateAndTwitter();

        mediator.emit('page:liveblog:ready', config, context);
    }

    return {
        init: ready
    };
});
