define([
    'common/common',
    'common/$',
    'qwery',
    'bonzo',
    'bean',
    'lodash/utilities/template',
    'lodash/functions/throttle',
    'common/_',
    'common/utils/scroller',
    'common/utils/detect',
    'common/modules/ui/autoupdate',
    'common/modules/live/filter',
    'common/modules/ui/notification-counter'
], function (
    common,
    $,
    qwery,
    bonzo,
    bean,
    _template,
    _throttle,
    _,
    scroller,
    detect,
    AutoUpdate,
    LiveFilter,
    NotificationCounter
) {
    'use strict';

//    function getKeyEvents() {
//        return qwery('.live-blog__blocks .is-key-event');
//    }

//    function createScrollTransitions(){
//
//        var selectedClass = 'live-blog__key-event--selected';
//
//        function unselect() {
//            bonzo(qwery('.'+selectedClass)).removeClass(selectedClass);
//        }
//
//        var curBinding;
//        function unselectOnScroll() {
//            bean.off(curBinding);
//            curBinding = bean.one(document, 'scroll', function() { unselect(); });
//        }
//
//        bean.on(qwery('.timeline')[0], 'click', '.timeline__key-event a', function(e){
//            var el = e.currentTarget,
//                eventId = bonzo(el).attr('data-event-id'),
//                targetEl = qwery('#'+eventId),
//                dim = bonzo(targetEl).offset();
//            scroller.scrollTo(dim.top, 500, 'easeOutQuint');
//            window.setTimeout(unselectOnScroll, 550);
//            bean.off(curBinding);
//            unselect();
//            bonzo(el).addClass(selectedClass);
//            e.stop();
//        });
//    }

    function getAllEvents() {
        return qwery('.live-blog__blocks .block');
    }

    function createKeyEventHTML(el) {
        var keyEventTemplate =
            '<li class="timeline__key-event" data-event-id="${ id }">' +
            '<span class="timeline__date">${ time }</span>' +
            '<a href="#${id}" data-event-id="${id}"><span class="timeline__title">${ title }</span></a>' +
            '</li>';
        var vals = {
            id: el.getAttribute('id'),
            title: $('.block-title', el).text(),
            time: $('.block-time', el).html()
        };
        return _template(keyEventTemplate, vals);
    }

    function createFillerHTML(postCount) {
        var fillerTemplate =
            '<li class="timeline__filler"><span class="timeline__filler-text">${ postCount } more posts</span></li>';
        return _template(fillerTemplate, {postCount: postCount});
    }

    function getTimelineHTML(events) {

        function recursiveRender(events, html) {
            var fillers = _.take(events, function(el) { return !bonzo(el).hasClass('is-key-event'); }),
                remaining;
            if (fillers.length) { // we have filler posts
                html += createFillerHTML(fillers.length);
                remaining = events.slice(fillers.length);
            } else if (events.length) { // key event at 0 index
                html += createKeyEventHTML(events[0]);
                remaining = events.slice(1);
            } else { // no events left
                return html;
            }
            return recursiveRender(remaining, html);
        }

        return recursiveRender(events, '');
    }

    function createTimeline() {
        var allEvents = getAllEvents();
        var timelineHTML = getTimelineHTML(allEvents);
        $('.js-live-blog__timeline').append(timelineHTML);
    }

    function createAutoRefresh(){
        common.mediator.on('page:article:ready', function(config, context) {
            if (config.page.isLive) {

                var timerDelay = /desktop|wide/.test(detect.getBreakpoint()) ? 30000 : 60000;
                new AutoUpdate({
                    path: function() {
                        var id = context.querySelector('.article-body .block').id,
                            path = window.location.pathname;

                        return path + '.json' + '?lastUpdate=' + id;
                    },
                    delay: timerDelay,
                    attachTo: $('.article-body', context)[0],
                    switches: config.switches,
                    manipulationType: 'prepend'
                }).init();
            }
        });
    }

    function createFilter() {
        common.mediator.on('page:article:ready', function(config, context) {
            new LiveFilter($('.js-blog-blocks', context)[0]).render($('.js-live-filter')[0]);
            new NotificationCounter().init();
        });
    }

    return {
        init: function () {
            createAutoRefresh();
            createFilter();
            createTimeline();
            //createScrollTransitions();
        }
    };
});