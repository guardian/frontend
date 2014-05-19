define([
    'common/$',
    'common/utils/config',
    'common/modules/component',
    'lodash/objects/mapValues'
],
function(
    $,
    config,
    component,
    mapValues
) {
    function UserDiscussions(opts) {
        this.setOptions(opts);
    }
    component.define(UserDiscussions);
    UserDiscussions.prototype.endpoint = '/discussion/user/:userId/discussions.json';
    UserDiscussions.prototype.defaultOptions = { userId: null };

    function getCommentStreams() {
        var opts = {
            'userId': 'data-user-id'
        };
        $('.js-comment-stream').each(function(el) {
            (new UserDiscussions(mapValues(opts, function(key) {
                return el.getAttribute(key);
            }))).fetch(el);
        });
    }



    function init() {
        getCommentStreams();
    }

    return {
        init: init
    };
});
