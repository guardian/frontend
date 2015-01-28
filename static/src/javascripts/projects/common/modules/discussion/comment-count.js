define([
    'bonzo',
    'qwery',
    'lodash/collections/forEach',
    'common/utils/$',
    'common/utils/_',
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
    _,
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
        return _.uniq(_.map(qwery('[' + attributeName + ']'), function (el) {
            return bonzo(el).attr(attributeName);
        }).join(','));
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
                    url = $node.attr('data-discussion-url') || getContentUrl(node),
                    $container,
                    meta,
                    html;

                if ($node.attr('data-discussion-closed') === 'true' && c.count === 0) {
                    return; // Discussion is closed and had no comments, we don't want to show a comment count
                }
                $node.removeClass('u-h');

                // put in trail__meta, if exists
                meta = qwery('.js-item__meta', node);

                format = $node.data('commentcount-format');
                html = template(templates[format] || defaultTemplate, {
                    url: url,
                    count: formatters.integerCommas(c.count),
                    label: commentOrComments
                });
                $container = meta.length ? bonzo(meta) : $node;
                $container.append(html);
                $node.removeAttr(attributeName);
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
