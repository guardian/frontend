define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/utils/url',
    'common/modules/component',
    'common/modules/discussion/activity-stream',
    'lodash/objects/mapValues'
], function (
    bean,
    bonzo,
    $,
    config,
    url,
    component,
    ActivityStream,
    mapValues) {
    function getActivityStream(cb) {
        var activityStream, opts = {
            userId: 'data-user-id',
            streamType: 'data-stream-type'
        };
        $('.js-activity-stream').each(function (el) {
            (activityStream = new ActivityStream(mapValues(opts, function (key) {
                return el.getAttribute(key);
            }))).fetch(el).then(function () {
                bonzo(el).removeClass('activity-stream--loading');
            });
        }).addClass('activity-stream--loading');
        cb(activityStream);
        return activityStream;
    }

    function selectTab(el) {
        $('.tabs__tab--selected').removeClass('tabs__tab--selected');
        bonzo(el).parent().addClass('tabs__tab--selected');
    }

    function setupActivityStreamChanger(activityStream) {
        bean.on(document.body, 'click', '.js-activity-stream-change', function (e) {
            var el = e.currentTarget,
                streamType = el.getAttribute('data-stream-type');
            e.preventDefault();
            selectTab(el);

            activityStream.change({
                page: 1,
                streamType: streamType
            }).then(function () {
                url.pushUrl({}, null,
                    '/user/id/' + activityStream.options.userId + (streamType !== 'discussions' ? '/' + streamType : ''), true);
            });
        });
    }

    function setupActivityStreamSearch(activityStream) {
        bean.on(document.body, 'submit', '.js-activity-stream-search', function (e) {
            var q = e.currentTarget.elements.q.value;
            e.preventDefault();
            selectTab($('a[data-stream-type="discussions"]'));
            activityStream.change({
                streamType: q !== '' ? 'search/' + encodeURIComponent(q) : 'comments'
            });
        });
    }

    function init() {
        getActivityStream(function (activityStream) {
            setupActivityStreamChanger(activityStream);
            setupActivityStreamSearch(activityStream);
        });
    }

    return {
        init: init
    };
});
