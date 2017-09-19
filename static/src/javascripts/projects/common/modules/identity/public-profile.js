import bean from 'bean';
import bonzo from 'bonzo';
import $ from 'lib/$';
import config from 'lib/config';
import url from 'lib/url';
import component from 'common/modules/component';
import ActivityStream from 'common/modules/discussion/activity-stream';
import mapValues from 'lodash/objects/mapValues';

function getActivityStream(cb) {
    var activityStream, dataOpts = {
        userId: 'data-user-id',
        streamType: 'data-stream-type'
    };
    $('.js-activity-stream').each(function(el) {
        var opts = mapValues(dataOpts, function(key) {
            return el.getAttribute(key);
        });

        opts.page = url.getUrlVars().page || 1;

        (activityStream = new ActivityStream.ActivityStream(opts)).fetch(el).then(function() {
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
    bean.on(document.body, 'click', '.js-activity-stream-change', function(e) {
        var el = e.currentTarget,
            streamType = el.getAttribute('data-stream-type');
        e.preventDefault();
        selectTab(el);

        activityStream.change({
            page: 1,
            streamType: streamType
        });
    });
}

function setupActivityStreamSearch(activityStream) {
    bean.on(document.body, 'submit', '.js-activity-stream-search', function(e) {
        var q = e.currentTarget.elements.q.value;
        e.preventDefault();
        selectTab($('a[data-stream-type="discussions"]'));
        activityStream.change({
            streamType: q !== '' ? 'search/' + encodeURIComponent(q) : 'comments'
        });
    });
}

function init() {
    getActivityStream(function(activityStream) {
        setupActivityStreamChanger(activityStream);
        setupActivityStreamSearch(activityStream);
    });
}

export default {
    init: init
};
