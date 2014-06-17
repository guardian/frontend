define([
    'bonzo',
    'common/$',
    'common/modules/component',
    'common/modules/discussion/api'
], function(
    bonzo,
    $,
    component,
    discussionApi
) {
    function ActivityStream(opts) {
        this.setOptions(opts);
    }
    component.define(ActivityStream);
    ActivityStream.prototype.endpoint = '/discussion/profile/:userId/:streamType.json';
    ActivityStream.prototype.componentClass = 'activity-stream';
    ActivityStream.prototype.defaultOptions = {
        userId: null,
        streamType: 'discussions'
    };
    ActivityStream.prototype.ready = function() {
        this.removeState('loading');
        this.on('click', '.js-disc-recommend-comment', this.recommendComment);
        $('.js-disc-recommend-comment').addClass('disc-comment__recommend--open');
    };
    ActivityStream.prototype.recommendComment = function(e) {
        var el = e.currentTarget;
        discussionApi.recommendComment(el.getAttribute('data-comment-id'));
        bonzo(el).addClass('disc-comment__recommend--active');
        $('.js-disc-recommend-count', el).each(function(countEl) {
            countEl.innerHTML = parseInt(countEl.innerHTML, 10)+1;
        });
    };
    ActivityStream.prototype.change = function(opts) {
        var $el = bonzo(this.elem).empty();
        this.setState('loading');
        this.setOptions(opts);
        this._fetch().then(function(resp) {
            $.create(resp.html).each(function(el) {
                this.elem = el;
                $el.replaceWith(this.elem);
            }.bind(this));
            this.removeState('loading');
        }.bind(this));
    };

    return ActivityStream;
});
