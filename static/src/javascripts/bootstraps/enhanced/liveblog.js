define([
    'bean',
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/scroller',
    'common/utils/template',
    'common/utils/url',
    'common/modules/accessibility/helpers',
    'common/modules/article/rich-links',
    'common/modules/commercial/liveblog-adverts',
    'common/modules/experiments/affix',
    'common/modules/live/filter',
    //'common/modules/ui/autoupdate',
    'common/modules/ui/dropdowns',
    'common/modules/ui/last-modified',
    'common/modules/ui/notification-counter',
    'common/modules/ui/relativedates',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'common/utils/robust',
    'common/utils/ajax-promise',
    'common/modules/ui/sticky'
], function (
    bean,
    bonzo,
    qwery,
    fastdom,
    $,
    config,
    detect,
    mediator,
    scroller,
    template,
    url,
    accessibility,
    richLinks,
    liveblogAdverts,
    Affix,
    LiveFilter,
    //AutoUpdate,
    dropdowns,
    lastModified,
    NotificationCounter,
    RelativeDates,
    articleLiveblogCommon,
    trail,
    robust,
    ajax,
    Sticky) {
    'use strict';

    var modules,
        //autoUpdate = null,
        latestBlockId;

    function getTimelineEvents() {
        var keyEvents = qwery('.is-key-event').slice(0, 7),
            newestSummary = qwery('.is-summary')[0];

        $('.js-timeline-event').removeClass('js-timeline-event');

        if (newestSummary) {
            bonzo(newestSummary).addClass('js-timeline-event');
            if (keyEvents.length === 7) {
                keyEvents.pop();
            }
        }

        bonzo(keyEvents).addClass('js-timeline-event');

        return qwery('.js-timeline-event');
    }

    function createScrollTransitions() {

        var curBinding,
            timeline      = qwery('.timeline')[0],
            selectedClass = 'live-blog__key-event--selected';

        function unselect() {
            fastdom.write(function () {
                $('.' + selectedClass).removeClass(selectedClass);
            });
        }

        function unselectOnScroll() {
            bean.off(curBinding);
            curBinding = mediator.once('window:throttledScroll', unselect);
        }

        bean.on(document.body, 'click', 'a', function (e) {
            var id = e.currentTarget.href.match(/.*(#.*)/);
            if (id && $(id[1]).hasClass('truncated-block')) {
                mediator.emit('module:liveblog:showkeyevents', true);
            }
        });

        if (timeline) {
            bean.on(timeline, 'click', '.timeline__link', function (e) {
                mediator.emit('module:liveblog:showkeyevents', true);
                $('.dropdown--live-feed').addClass('dropdown--active');
                var $el = bonzo(e.currentTarget),
                    eventId = $el.attr('data-event-id'),
                    title = $('.timeline__title', $el).text(),
                    targetEl = qwery('#' + eventId),
                    dim = bonzo(targetEl).offset(),
                    duration = 500,
                    slimHeaderHeight = 52,
                    topPadding = 12,
                    scrollAmount;

                scrollAmount = config.switches.viewability ? dim.top - slimHeaderHeight : dim.top - topPadding;
                scroller.scrollTo(scrollAmount, duration, 'easeOutQuint');
                window.setTimeout(unselectOnScroll, 550);
                bean.off(curBinding);
                unselect();
                $el.addClass(selectedClass);
                url.pushUrl({blockId: eventId}, title, window.location.pathname + '#' + eventId, true);
                e.stop();
            });
        }
    }

    function createKeyEventHTML(el) {
        var keyEventTemplate = '<li class="timeline__item" data-event-id="<%=id%>">' +
                '<a class="timeline__link" href="#<%=id%>" data-event-id="<%=id%>">' +
                '<span class="timeline__date"><%=time%></span><span class="timeline__title u-underline"><%=title%></span></a></li>',
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
        // There may be no blocks at all. 'block-0' will return any new blocks found.
        //latestBlockId ? latestBlockId
        var id = 'block-0';
        return window.location.pathname + '.json?numNewBlocks=' + id;
    }

    function getNewBlocksPath() {
        // There may be no blocks at all. 'block-0' will return any new blocks found.
        //latestBlockId ? latestBlockId
        var id = 'block-0';
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
            var timelineHTML, dropdown,
                allEvents = getTimelineEvents();
            if (allEvents.length > 0) {
                timelineHTML = getTimelineHTML(allEvents);

                $('.js-live-blog__timeline')
                    .empty()
                    .append(timelineHTML);
                dropdown = $('.js-live-blog__timeline-container .dropdown');
                dropdown.addClass('dropdown--active');
                dropdowns.updateAria(dropdown);

                if (detect.isBreakpoint({ min: 'desktop' }) && config.page.keywordIds.indexOf('football/football') < 0 && config.page.keywordIds.indexOf('sport/rugby-union') < 0) {
                    var topMarker = qwery('.js-top-marker')[0];
                    /*eslint-disable no-new*/
                    new Affix({
                        element: qwery('.js-live-blog__timeline-container')[0],
                        topMarker: topMarker,
                        bottomMarker: qwery('.js-bottom-marker')[0],
                        containerElement: qwery('.js-live-blog__key-events')[0]
                    });
                    /*eslint-enable no-new*/
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
            //if (config.page.isLive) {
            //
            //    var timerDelay = detect.isBreakpoint({ min: 'desktop' }) ? 15000 : 60000;
            //    autoUpdate = new AutoUpdate({
            //        path: getUpdatePath,
            //        delay: timerDelay,
            //        backoff: 2,
            //        backoffMax: 1000 * 60 * 20,
            //        attachTo: $('.js-liveblog-body')[0],
            //        switches: config.switches,
            //        manipulationType: 'prepend'
            //    });
            //    autoUpdate.init();
            //}
            //
            //mediator.on('module:filter:toggle', function (orderedByOldest) {
            //    if (!autoUpdate) {
            //        return;
            //    }
            //    if (orderedByOldest) {
            //        autoUpdate.setManipulationType('append');
            //    } else {
            //        autoUpdate.setManipulationType('prepend');
            //    }
            //});

            if (config.page.isLive) {
                latestBlockId = $('.js-liveblog-body').data('most-recent-block');

                setInterval(function () {
                    modules.fetchUpdatesCount(latestBlockId);
                }, 10000);

                new Sticky(qwery('.blog__updates-box-tofix'), { top: 60 }).init();

                bean.on(document.body, 'click', '.js-updates-button', function () {
                    modules.toastButtonClicked(latestBlockId);
                });
            }
        },

        fetchUpdatesCount: function () {
            return ajax({
                url: getUpdatePath(),
                type: 'json',
                method: 'get',
                crossOrigin: true
            }).then(function (resp) {
                if (resp.newBlocksCount > 0) {
                    var lbOffset = $('.js-liveblog-body').offset().top,
                        scrollPos = window.scrollY;

                    if (scrollPos < lbOffset && scrollPos + window.innerHeight > lbOffset) {
                        modules.injectNewBlocks();
                    } else {
                        modules.refreshUpdatesCount(resp.newBlocksCount);
                    }
                }
            });
        },

        toastButtonClicked: function () {
            var $updateBox = $('.js-updates-button');
            scroller.scrollToElement(qwery('.js-blog-blocks'), 300, 'easeOutQuad');
            $updateBox.addClass('loading');
            modules.injectNewBlocks();
        },

        refreshUpdatesCount: function (count) {
            var $updateBox = $('.js-updates-button'),
                $updateBoxContainer = $('.blog__updates-box-container'),
                $updateBoxText = $('.blog__updates-box-text', $updateBox);

            $updateBox.removeClass('blog__updates-box--closed');
            $updateBoxText.html(count + ' new updates');
            $updateBox.addClass('blog__updates-box--open');
            $updateBoxContainer.addClass('blog__updates-box-container--open');
        },

        injectNewBlocks: function () {
            return ajax({
                url: getNewBlocksPath(),
                type: 'json',
                method: 'get',
                crossOrigin: true
            }).then(function (resp) {
                if (resp.html) {
                    $('#' + latestBlockId).before(resp.html);
                    latestBlockId = $('.block').first().attr('id');
                    setTimeout(function () {
                        modules.resetToastButton();
                    }, 1000);
                    RelativeDates.init();
                }
            });
        },

        resetToastButton: function () {
            $('.js-updates-button').removeClass('blog__updates-box--open').removeClass('loading').addClass('blog__updates-box--closed');
            $('.blog__updates-box-container').removeClass('blog__updates-box-container--open');
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

        accessibility: function () {
            accessibility.shouldHideFlashingElements();
        }
    };

    function ready() {
        robust.catchErrorsAndLogAll([
            ['lb-a11y',       modules.accessibility],
            ['lb-adverts',    modules.initAdverts],
            ['lb-filter',     modules.createFilter],
            ['lb-timeline',   modules.createTimeline],
            ['lb-autoupdate', modules.createAutoUpdate],
            ['lb-timestamp',  modules.keepTimestampsCurrent],
            ['lb-updates',    modules.handleUpdates],
            ['lb-richlinks',  richLinks.upgradeRichLinks]
        ]);

        trail();
        articleLiveblogCommon();

        robust.catchErrorsAndLog('lb-ready',   function () { mediator.emit('page:liveblog:ready'); });
    }

    return {
        init: ready
    };
});
