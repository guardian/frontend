import bonzo from 'bonzo';
import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'lib/$';
import fetchJSON from 'lib/fetch-json';
import formatters from 'lib/formatters';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import svgs from 'common/views/svgs';
import commentCountTemplate from 'raw-loader!common/views/discussion/comment-count.html';
import commentCountContentTemplate from 'raw-loader!common/views/discussion/comment-count--content.html';
import commentCountContentImmersiveTemplate from 'raw-loader!common/views/discussion/comment-count--content-immersive.html';
import groupBy from 'lodash/collections/groupBy';
import forEach from 'lodash/collections/forEach';
var attributeName = 'data-discussion-id',
    countUrl = '/discussion/comment-counts.json?shortUrls=',
    templates = {
        content: commentCountContentTemplate,
        contentImmersive: commentCountContentImmersiveTemplate
    },
    defaultTemplate = commentCountTemplate;

function getElementsIndexedById(context) {
    var elements = qwery('[' + attributeName + ']', context);

    return groupBy(elements, function(el) {
        return bonzo(el).attr(attributeName);
    });
}

function getContentIds(indexedElements) {
    return Object.keys(indexedElements).sort().join(',');
}

function getContentUrl(node) {
    var a = node.getElementsByTagName('a')[0];
    return (a ? a.pathname : '') + '#comments';
}

function renderCounts(counts, indexedElements) {
    counts.forEach(function(c) {
        forEach(indexedElements[c.id], function(node) {
            var format,
                $node = bonzo(node),
                url = $node.attr('data-discussion-url') || getContentUrl(node),
                $container,
                meta,
                html;

            if ($node.attr('data-discussion-closed') === 'true' && c.count === 0) {
                return; // Discussion is closed and had no comments, we don't want to show a comment count
            }

            format = $node.data('commentcount-format');
            html = template(templates[format] || defaultTemplate, {
                url: url,
                icon: svgs.inlineSvg('commentCount16icon', ['inline-tone-fill']),
                count: formatters.integerCommas(c.count)
            });

            meta = qwery('.js-item__meta', node);
            $container = meta.length ? bonzo(meta) : $node;

            fastdom.write(function() {
                $container.append(html);
                $node.removeAttr(attributeName);
                $node.removeClass('u-h');
            });
        });
    });

    // This is the only way to ensure that this event is fired after all the comment counts have been rendered to
    // the DOM.
    fastdom.write(function() {
        mediator.emit('modules:commentcount:loaded', counts);
    });
}

function getCommentCounts(context) {
    fastdom.read(function() {
        var indexedElements = getElementsIndexedById(context || document.body);
        var endpoint = countUrl + getContentIds(indexedElements);

        fetchJSON(endpoint, {
            mode: 'cors',
        }).then(function(response) {
            if (response && response.counts) {
                renderCounts(response.counts, indexedElements);
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

export default {
    init: init,
    getCommentCounts: getCommentCounts,
    getContentIds: getContentIds,
    getElementsIndexedById: getElementsIndexedById
};
