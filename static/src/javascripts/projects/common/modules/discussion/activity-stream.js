define([
    'bonzo',
    'bean',
    'common/utils/$',
    'common/modules/component',
    'common/modules/discussion/api'
], function (
    bonzo,
    bean,
    $,
    component,
    discussionApi
) {
    function ActivityStream(opts) {
        this.setOptions(opts);
    }
    component.define(ActivityStream);
    ActivityStream.prototype.endpoint = '/discussion/profile/:userId/:streamType.json?page=:page';
    ActivityStream.prototype.componentClass = 'activity-stream';
    ActivityStream.prototype.defaultOptions = {
        page: 1,
        streamType: 'discussions',
        userId: null
    };
    ActivityStream.prototype.ready = function () {
        this.removeState('loading');
        this.on('click', '.js-disc-recommend-comment', this.recommendComment);
        $('.js-disc-recommend-comment').addClass('disc-comment__recommend--open');
        pagination(this);
    };
    ActivityStream.prototype.recommendComment = function (e) {
        var el = e.currentTarget;
        discussionApi.recommendComment(el.getAttribute('data-comment-id'));
        bonzo(el).addClass('disc-comment__recommend--active');
        $('.js-disc-recommend-count', el).each(function (countEl) {
            countEl.innerHTML = parseInt(countEl.innerHTML, 10) + 1;
        });
    };
    ActivityStream.prototype.change = function (opts) {
        var $el = bonzo(this.elem).empty();
        this.setState('loading');
        this.setOptions(opts);
        return this._fetch().then(function (resp) {
            $.create(resp.html).each(function (el) {
                $el.html($(el).html()).attr({ 'class': el.className });
            });
            this.removeState('loading');
        }.bind(this));
    };

    function pagination(activityStream) {
        bean.on(activityStream.elem, 'click', '.js-activity-stream-page-change', function (e) {
            var page = e.currentTarget.getAttribute('data-page');
            e.preventDefault();

            activityStream.change({
                page: page
            });
        });
    }

    return ActivityStream;
});
