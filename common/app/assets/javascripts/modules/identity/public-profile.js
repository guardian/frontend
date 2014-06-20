define([
    'common/utils/$',
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
    function getActivityStream() {
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
        return activityStream;
    }

    function setupActivityStreamChanger(activityStream) {
        bean.on(context(), 'click', '.js-activity-stream-change', function(e) {
            var el = e.currentTarget;
            e.preventDefault();

            $('.tabs__tab--selected').removeClass('tabs__tab--selected');
            bonzo(el).parent().addClass('tabs__tab--selected');

            activityStream.change({
                streamType: el.getAttribute('data-stream-type')
            });
        });
    }

    function init() {
        setupActivityStreamChanger(getActivityStream());
    }

    return {
        init: init
    };
});
