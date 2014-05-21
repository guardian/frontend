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
    function ProfileDiscussions(opts) {
        this.setOptions(opts);
    }
    component.define(ProfileDiscussions);
    ProfileDiscussions.prototype.endpoint = '/discussion/user/:userId/:streamType.json';
    ProfileDiscussions.prototype.defaultOptions = {
        userId: null,
        streamType: 'discussions'
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
