define([
    'bonzo',
    'qwery',
    'lodash/collections/forEach',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/formatters',
    'common/utils/mediator',
    'common/utils/request-animation-frame',
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
    requestAnimationFrame,
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

    function getElementsIndexedById() {
        var elements = qwery('[' + attributeName + ']');

        return _.zipObject(_.map(elements, function (el) {
            return bonzo(el).attr(attributeName);
        }), elements);
    }

    function getContentIds(indexedElements) {
        return _.chain(indexedElements)
                    .keys()
                    .uniq()
                    .sortBy()
                    .join(',')
                    .value();
    }

    function getContentUrl(node) {
        var a = node.getElementsByTagName('a')[0];
        return (a ? a.pathname : '') + '#comments';
    }

    function renderCounts(counts, indexedElements) {
        counts.forEach(function (c) {
            var node = indexedElements[c.id],
                format,
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

            format = $node.data('commentcount-format');
            html = template(templates[format] || defaultTemplate, {
                url: url,
                count: formatters.integerCommas(c.count),
                label: commentOrComments
            });

            meta = qwery('.js-item__meta', node);
            $container = meta.length ? bonzo(meta) : $node;

            requestAnimationFrame(function () {
                $container.append(html);
                $node.removeAttr(attributeName);
            });
        });

        // This is the only way to ensure that this event is fired after all the comment counts have been rendered to
        // the DOM.
        requestAnimationFrame(function () {
            mediator.emit('modules:commentcount:loaded', counts);
        });
    }

    function getCommentCounts() {
        var indexedElements = getElementsIndexedById(),
            ids = getContentIds(indexedElements);

        ajax({
            url: countUrl + ids,
            type: 'json',
            method: 'get',
            crossOrigin: true,
            success: function (response) {
                if (response && response.counts) {
                    renderCounts(response.counts, indexedElements);
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
        getContentIds: getContentIds,
        getElementsIndexedById: getElementsIndexedById
    };
});
