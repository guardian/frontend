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
const attributeName = 'data-discussion-id',
      countUrl = '/discussion/comment-counts.json?shortUrls=',
      templates = {
          content: commentCountContentTemplate,
          contentImmersive: commentCountContentImmersiveTemplate
      },
      defaultTemplate = commentCountTemplate;

function getElementsIndexedById(context) {
    const elements = qwery('[' + attributeName + ']', context);

    return groupBy(elements, el => bonzo(el).attr(attributeName));
}

function getContentIds(indexedElements) {
    return Object.keys(indexedElements).sort().join(',');
}

function getContentUrl(node) {
    const a = node.getElementsByTagName('a')[0];
    return (a ? a.pathname : '') + '#comments';
}

function renderCounts(counts, indexedElements) {
    counts.forEach(c => {
        forEach(indexedElements[c.id], node => {
            let format;
            const $node = bonzo(node);
            const url = $node.attr('data-discussion-url') || getContentUrl(node);
            let $container;
            let meta;
            let html;

            if ($node.attr('data-discussion-closed') === 'true' && c.count === 0) {
                return; // Discussion is closed and had no comments, we don't want to show a comment count
            }

            format = $node.data('commentcount-format');
            html = template(templates[format] || defaultTemplate, {
                url,
                icon: svgs.inlineSvg('commentCount16icon', ['inline-tone-fill']),
                count: formatters.integerCommas(c.count)
            });

            meta = qwery('.js-item__meta', node);
            $container = meta.length ? bonzo(meta) : $node;

            fastdom.write(() => {
                $container.append(html);
                $node.removeAttr(attributeName);
                $node.removeClass('u-h');
            });
        });
    });

    // This is the only way to ensure that this event is fired after all the comment counts have been rendered to
    // the DOM.
    fastdom.write(() => {
        mediator.emit('modules:commentcount:loaded', counts);
    });
}

function getCommentCounts(context) {
    fastdom.read(() => {
        const indexedElements = getElementsIndexedById(context || document.body);
        const endpoint = countUrl + getContentIds(indexedElements);

        fetchJSON(endpoint, {
            mode: 'cors',
        }).then(response => {
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
    init,
    getCommentCounts,
    getContentIds,
    getElementsIndexedById
};
