define([
    'bonzo',
    'qwery',
    'lodash/collections/forEach',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/formatters',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/discussion/comment-count.html',
    'text!common/views/discussion/comment-count--content.html'
], function (
    bonzo,
    qwery,
    forEach,
    $,
    ajax,
    formatters,
    mediator,
    template,
    commentCountTemplate,
    commentCountContentTemplate
) {

    var attributeName = 'data-discussion-id',
        countUrl = '/discussion/comment-counts.json?shortUrls=',
        templates = {
            content: commentCountContentTemplate
        },
        defaultTemplate = commentCountTemplate;

    function getContentIds() {
        var nodes = document.body.querySelectorAll('[' + attributeName + ']'),
            l = nodes.length - 1,
            data = '';

        Array.prototype.forEach.call(nodes, function (el, i) {
            data += el.getAttribute(attributeName);
            if (i < l) { data += ','; }
        });

        return data;
    }

    function getContentUrl(node) {
        var a = node.getElementsByTagName('a')[0];
        return (a ? a.pathname : '') + '#comments';
    }

    function renderCounts(counts) {
        counts.forEach(function (c) {
            forEach(qwery('[data-discussion-id="' + c.id + '"]'), function (node) {
                var format,
                    $node = bonzo(node),
                    commentOrComments = (c.count === 1 ? 'comment' : 'comments'),
                    $container,
                    meta;

                if ($node.attr('data-discussion-closed') === 'true' && c.count === 0) {
                    return; // Discussion is closed and had no comments, we don't want to show a comment count
                }
                $node.removeClass('u-h');

                if ($node.attr('data-discussion-inline-upgrade') === 'true') {
                    $('.js-item__comment-count', node).append(formatters.integerCommas(c.count));
                    $('.js-item__comment-or-comments', node).append(commentOrComments);
                    $('.js-item__inline-comment-template', node).show('inline');
                } else {
                    // put in trail__meta, if exists
                    meta = qwery('.item__meta, .card__meta, .js-append-commentcount', node);
                    $container = meta.length ? bonzo(meta) : $node;
                    format = $node.data('commentcount-format');

                    $container.append(template(templates[format] || defaultTemplate, {
                        url: getContentUrl(node),
                        count: formatters.integerCommas(c.count),
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
            success: function (response) {
                if (response && response.counts) {
                    renderCounts(response.counts);
                    mediator.emit('modules:commentcount:loaded', response.counts);
                }
            }
        });
    }

    function init() {
        if (document.body.querySelector('[data-discussion-id]')) {
            getCommentCounts();
        }

        //Load new counts when more trails are loaded
        mediator.on('module:trailblock-show-more:render', function () { getCommentCounts(); });
        mediator.on('modules:related:loaded', function () { getCommentCounts(); });
    }

    return {
        init: init,
        getCommentCounts: getCommentCounts,
        getContentIds: getContentIds
    };
});
