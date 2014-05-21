define([
    'common/$',
    'bonzo',
    'common/utils/config',
    'common/modules/component',
    'common/modules/discussion/api',
    'lodash/objects/mapValues'
],
function(
    $,
    bonzo,
    config,
    component,
    discussionApi,
    mapValues
) {
    function ProfileDiscussions(opts) {
        this.setOptions(opts);
    }
    component.define(ProfileDiscussions);
    ProfileDiscussions.prototype.endpoint = '/discussion/profile/:userId/:streamType.json';
    ProfileDiscussions.prototype.defaultOptions = {
        userId: null,
        streamType: 'discussions'
    };
    ProfileDiscussions.prototype.ready = function() {
        this.on('click', '.js-disc-recommend-comment', this.recommendComment);
        $('.js-disc-recommend-comment').addClass('disc-comment__recommend--open');
    };
    ProfileDiscussions.prototype.recommendComment = function(e) {
        var el = e.currentTarget;
        discussionApi.recommendComment(el.getAttribute('data-comment-id'));
        bonzo(el).addClass('disc-comment__recommend--active');
        $('.js-disc-recommend-count', el).each(function(countEl) {
            countEl.innerHTML = parseInt(countEl.innerHTML, 10)+1;
        });
    };

    function getProfileDiscussions() {
        var opts = {
            userId: 'data-user-id',
            streamType: 'data-stream-type'
        };
        $('.js-comment-stream').each(function(el) {
            (new ProfileDiscussions(mapValues(opts, function(key) {
                return el.getAttribute(key);
            }))).fetch(el);
        });
    }

    function init() {
        getProfileDiscussions();
    }

    return {
        init: init
    };
});
