define([
    'common/utils/$',
    'bonzo',
    'qwery',
    'lodash/collections/forEach',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/utils/template',
    'text!common/views/discussion/comment-count.html'
], function (
    $,
    bonzo,
    qwery,
    forEach,
    mediator,
    ajax,
    template,
    commentCountTemplate
) {
    var attributeName = 'data-discussion-id',
        countUrl = '/discussion/comment-counts.json?shortUrls=';

    function getContentIds() {
        var nodes = document.body.querySelectorAll('[' + attributeName + ']'),
            l = nodes.length-1,
            data = '';

        Array.prototype.forEach.call(nodes, function(el, i) {
            data += el.getAttribute(attributeName);
            if(i < l) { data += ','; }
        });

        return data;
    }

    function getContentUrl(node) {
        return node.getElementsByTagName('a')[0].pathname + '#comments';
    }

    function renderCounts(counts) {
        counts.forEach(function(c){
            forEach(qwery('[data-discussion-id="' + c.id +'"]'), function (node) {
                var $node = bonzo(node),
                    commentOrComments = (c.count === 1 ? 'comment' : 'comments'),
                    $container,
                    meta;

                if ($node.attr('data-discussion-closed') === 'true' && c.count === 0) {
                    return; // Discussion is closed and had no comments, we don't want to show a comment count
                }

                if ($node.attr('data-discussion-inline-upgrade') === 'true') {
                    $('.js-item__comment-count', node).append(c.count + '');
                    $('.js-item__comment-or-comments', node).append(commentOrComments);
                    $('.js-item__inline-comment-template', node).show('inline');
                } else {
                    // put in trail__meta, if exists
                    meta = qwery('.item__meta, .card__meta, .js-append-commentcount', node);
                    $container = meta.length ? bonzo(meta) : $node;

                    $container.append(template(commentCountTemplate, {
                        url: getContentUrl(node),
                        count: c.count,
                        label: commentOrComments
                    }));

                    $node.removeAttr(attributeName);
                }
            });
        });
    }

    function getCommentCounts() {
        var ids = getContentIds();
        ajax({
            url: countUrl + ids,
            type: 'json',
            method: 'get',
            crossOrigin: true,
            success: function(response) {
                if(response && response.counts) {
                    renderCounts(response.counts);
                    mediator.emit('modules:commentcount:loaded', response.counts);
                }
            }
        });
    }

    function init() {
        if(document.body.querySelector('[data-discussion-id]')) {
            getCommentCounts();
        }

        //Load new counts when more trails are loaded
        mediator.on('module:trailblock-show-more:render', function() { getCommentCounts(); });
        mediator.on('modules:related:loaded', function() { getCommentCounts(); });
    }

    return {
        init: init,
        getCommentCounts: getCommentCounts,
        getContentIds: getContentIds
    };
});
