define([
    'bonzo',
    'fastdom',
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
    fastdom,
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

    function getElementsIndexedById(context) {
        var elements = qwery('[' + attributeName + ']', context);

        return _.groupBy(elements, function (el) {
            return bonzo(el).attr(attributeName);
        });
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
        fastdom.read(function () {
            counts.forEach(function (c) {
                _.forEach(indexedElements[c.id], function (node) {
                    var format,
                        $node = bonzo(node),
                        commentOrComments = (c.count === 1 ? 'comment' : 'comments'),
                        url = $node.attr('data-discussion-url') || getContentUrl(node),
                        hideLabel = $node.attr('data-discussion-hide-label') === 'true',
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
                        label: hideLabel ? '' : commentOrComments
                    });

                    meta = qwery('.js-item__meta', node);
                    $container = meta.length ? bonzo(meta) : $node;

                    fastdom.write(function () {
                        $container.append(html);
                        $node.removeAttr(attributeName);
                    });
                });
            });

            // This is the only way to ensure that this event is fired after all the comment counts have been rendered to
            // the DOM.
            fastdom.write(function () {
                mediator.emit('modules:commentcount:loaded', counts);
            });
        });
    }

    function getCommentCounts(context) {
        fastdom.read(function () {
            var indexedElements = getElementsIndexedById(context || document.body),
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
        });
    }

    function init() {
        if (document.body.querySelector('[data-discussion-id]')) {
            getCommentCounts(document.body);
        }

        //Load new counts when more trails are loaded
        mediator.on('modules:related:loaded', getCommentCounts);
    }

    return {
        init: init,
        getCommentCounts: getCommentCounts,
        getContentIds: getContentIds,
        getElementsIndexedById: getElementsIndexedById
    };
});
