define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/preferences',
    'common/utils/scroller',
    'common/utils/template',
    'common/utils/url',
    'common/modules/commercial/liveblog-adverts',
    'common/modules/experiments/affix',
    'common/modules/live/filter',
    'common/modules/ui/autoupdate',
    'common/modules/ui/dropdowns',
    'common/modules/ui/message',
    'common/modules/ui/notification-counter',
    'bootstraps/article',
    'common/modules/ui/relativedates'
], function (
    bean,
    bonzo,
    qwery,
    $,
    _,
    config,
    detect,
    mediator,
    preferences,
    scroller,
    template,
    url,
    liveblogAdverts,
    Affix,
    LiveFilter,
    AutoUpdate,
    dropdowns,
    Message,
    NotificationCounter,
    article,
    RelativeDates
) {
    'use strict';

    var modules,
        affix = null,
        autoUpdate = null;

    function getTimelineEvents() {
        var keyEvents = qwery('.is-key-event').slice(0, 7),
            newestSummary = qwery('.is-summary')[0];

        $('.js-timeline-event').removeClass('js-timeline-event');

        if (newestSummary) {
            bonzo(newestSummary).addClass('js-timeline-event');
            keyEvents.pop();
        }

        bonzo(keyEvents).addClass('js-timeline-event');

        return qwery('.js-timeline-event');
    }

    function createScrollTransitions() {

        var curBinding,
            selectedClass = 'live-blog__key-event--selected';

        function unselect() {
            $('.' + selectedClass).removeClass(selectedClass);
        }

        function unselectOnScroll() {
            bean.off(curBinding);
            curBinding = bean.one(document, 'scroll', function () { unselect(); });
        }

        bean.on(document.body, 'click', 'a', function (e) {
            var id = e.currentTarget.href.match(/.*(#.*)/)[1];
            if (id && $(id).hasClass('truncated-block')) {
                mediator.emit('module:liveblog:showkeyevents', true);
            }
        });

        bean.on(qwery('.timeline')[0], 'click', '.timeline__link', function (e) {
            mediator.emit('module:liveblog:showkeyevents', true);
            $('.dropdown--live-feed').addClass('dropdown--active');
            var $el = bonzo(e.currentTarget),
                eventId = $el.attr('data-event-id'),
                title = $('.timeline__title', $el).text(),
                targetEl = qwery('#' + eventId),
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
                '<span class="timeline__date">{{time}}</span><span class="timeline__title u-underline">{{title}}</span></a></li>',
            data = {
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

    function getUpdatePath() {
        var id,
            blocks = qwery('.js-liveblog-body .block'),
            newestBlock = null;

        if (autoUpdate.getManipulationType() === 'append') {
            newestBlock = blocks.pop();
        } else {
            newestBlock = blocks.shift();
        }

        // There may be no blocks at all. 'block-0' will return any new blocks found.
        id = newestBlock ? newestBlock.id : 'block-0';
        return window.location.pathname + '.json?lastUpdate=' + id;
    }

    modules = {

        initAdverts: function () {
            liveblogAdverts.init();
        },

        createFilter: function () {
            new LiveFilter($('.js-blog-blocks')[0]).ready();
            new NotificationCounter().init();
        },

        createTimeline: function () {
            var timelineHTML, dropdown, topMarker,
                allEvents = getTimelineEvents();
            if (allEvents.length > 0) {
                timelineHTML = getTimelineHTML(allEvents);

                $('.js-live-blog__timeline')
                    .empty()
                    .append(timelineHTML);
                dropdown = $('.js-live-blog__timeline-container .dropdown');
                dropdown.addClass('dropdown--active');
                dropdowns.updateAria(dropdown);

                if (detect.isBreakpoint({ min: 'desktop' }) && config.page.keywordIds.indexOf('football/football') < 0) {
                    topMarker = qwery('.js-top-marker')[0];
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

        handleUpdates: function () {
            mediator.on('modules:autoupdate:updates', function () {
                modules.createTimeline();
            });
        },

        createAutoUpdate: function () {

            if (config.page.isLive) {

                var timerDelay = detect.isBreakpoint({ min: 'desktop' }) ? 5000 : 60000;
                autoUpdate = new AutoUpdate({
                    path: getUpdatePath,
                    delay: timerDelay,
                    backoff: 2,
                    backoffMax: 1000 * 60 * 20,
                    attachTo: $('.js-liveblog-body')[0],
                    switches: config.switches,
                    manipulationType: 'prepend'
                });
                autoUpdate.init();
            }

            mediator.on('module:filter:toggle', function (orderedByOldest) {
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

        showFootballLiveBlogMessage: function () {
            var msg, releaseMessage,
                isFootballLiveBlog = config.page.pageId.indexOf('football/live/') === 0,
                notMobile = detect.getBreakpoint() !== 'mobile';

            if (isFootballLiveBlog && notMobile && !preferences.hasOptedIntoResponsive()) {

                msg = '<p class="site-message__message" id="site-message__message">' +
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
                releaseMessage = new Message('football-live-blog', {pinOnHide: true});

                releaseMessage.show(msg);
            }
        },

        keepTimestampsCurrent: function () {
            var dates = RelativeDates;
            window.setInterval(
                function () {
                    dates.init();
                },
                60000
            );

        },

        truncateBlockShareIcons: function (blockShareEl) {
            var truncated = qwery('> *', blockShareEl).slice(2);
            bonzo(truncated).addClass('u-h');
            $('.js-blockshare-expand', blockShareEl).removeClass('u-h');
        },

        initBlockSharing: function () {
            bean.on(document.body, 'click', '.js-blockshare-expand', function (e) {
                var expandButton = bonzo(e.currentTarget),
                    container = expandButton.parent()[0];
                $('> *', container).removeClass('u-h');
                expandButton.addClass('u-h');
            });
            $.forEachElement('.block-share', modules.truncateBlockShareIcons);
        }
    };

    function ready() {
        modules.initAdverts();
        modules.createFilter();
        modules.createTimeline();
        modules.createAutoUpdate();
        modules.showFootballLiveBlogMessage();
        modules.keepTimestampsCurrent();
        modules.initBlockSharing();
        modules.handleUpdates();

        // re-use modules from article bootstrap
        article.modules.initOpen(config);
        article.modules.initFence();
        article.modules.initTruncateAndTwitter();

        mediator.emit('page:liveblog:ready', config);
    }

    return {
        init: ready
    };
});
