define([
    'common/$',
    'bonzo',
    'bean',
    'common/utils/config',
    'common/utils/context',
    'common/modules/component',
    'common/modules/discussion/api',
    'common/modules/discussion/activity-stream',
    'lodash/objects/mapValues'
],
function(
    $,
    bonzo,
    bean,
    config,
    context,
    component,
    discussionApi,
    ActivityStream,
    mapValues
) {
    function getActivityStream(cb) {
        var activityStream, opts = {
            userId: 'data-user-id',
            streamType: 'data-stream-type'
        };
        $('.js-activity-stream').each(function(el) {
            (activityStream = new ActivityStream(mapValues(opts, function(key) {
                return el.getAttribute(key);
            }))).fetch(el).then(function() {
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
        bean.on(context(), 'click', '.js-activity-stream-change', function(e) {
            e.preventDefault();
            var el = e.currentTarget;
            selectTab(el);

            activityStream.change({
                streamType: el.getAttribute('data-stream-type')
            });
        });
    }

    function setupActivityStreamSearch(activityStream) {
        bean.on(context(), 'submit', '.js-activity-stream-search', function(e) {
            e.preventDefault();
            var q = e.currentTarget.elements.q.value;
            selectTab($('[data-stream-type="discussions"]'));
            activityStream.change({
                streamType: q !== '' ? 'search/'+ encodeURIComponent(q) : 'comments'
            });
        });
    }

    function init() {
        getActivityStream(function(activityStream) {
            setupActivityStreamChanger(activityStream);
            setupActivityStreamSearch(activityStream);
        });
    }

    return {
        init: init
    };
});
