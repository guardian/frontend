// @flow
import fastdom from 'lib/fastdom-promise';
import fetchJSON from 'lib/fetch-json';
import { integerCommas } from 'lib/formatters';
import mediator from 'lib/mediator';
import { addClassesAndTitle } from 'common/views/svg';
import commentCount16icon from 'svgs/icon/comment-16.svg';

type Map<K, V> = { [k: K]: V };

const attributeName = 'data-discussion-id';
const countUrl = '/discussion/comment-counts.json?shortUrls=';

const commentCountTemplate = (
    url: string,
    icon: string,
    count: string
): string =>
    `<a class="fc-trail__count fc-trail__count--commentcount" href="${url}" data-link-name="Comment count">${icon} ${count}</a>`;

const commentCountContentTemplate = (
    url: string,
    icon: string,
    count: string
): string =>
    `<a href="${url}" data-link-name="Comment count" class="commentcount2 tone-colour">
        <h3 class="commentcount2__heading">${icon} <span class ="commentcount2__text u-h">Comments</span></h3>
        <span class="commentcount2__value tone-colour js_commentcount_actualvalue">${count}</span>
    </a>`;

const commentCountContentImmersiveTemplate = (
    url: string,
    icon: string,
    count: string
): string =>
    `<a href="${url}" data-link-name="Comment count" class="commentcount2 tone-colour">
        ${icon}<span class="commentcount__value">${count}</span> Comments
    </a>`;

const templates = {
    content: commentCountContentTemplate,
    contentImmersive: commentCountContentImmersiveTemplate,
};
const defaultTemplate = commentCountTemplate;

const getElementsIndexedById = (): Map<string, Element> => {
    const elements: Element[] = Array.from(
        document.querySelectorAll(`[${attributeName}]`)
    );

    return elements.reduce((acc, el) => {
        const key = el.getAttribute(attributeName);
        if (!key) return acc;
        return Object.freeze(Object.assign({}, acc, { [key]: el }));
    }, {});
};

const getContentIds = <A>(m: Map<string, A>): string =>
    Object.keys(m).sort().join(',');

const getContentUrl = (node: Element): string =>
    `${Array.from(node.getElementsByTagName('a'))
        .slice(0, 1)
        .map(a => a.pathname)
        .join('')}#comments`;

const updateCommentCount = (node: Element, count: number): Promise<void> => {
    const url = node.getAttribute('data-discussion-url') || getContentUrl(node);

    if (node.getAttribute('data-discussion-closed') === 'true' && count === 0) {
        // Discussion is closed and had no comments, we don't want to show a comment count
        return Promise.resolve();
    }

    const format = node.getAttribute('data-commentcount-format');
    const html = ((format && templates[format]) || defaultTemplate)(
        url,
        addClassesAndTitle(commentCount16icon.markup, ['inline-tone-fill']),
        integerCommas(count) || ''
    );

    const meta = node.querySelector('.js-item__meta');
    const container = meta || node;

    return fastdom.write(() => {
        container.insertAdjacentHTML('beforeend', html);
        node.removeAttribute(attributeName);
        node.classList.remove('u-h');
    });
};

const renderCounts = (
    counts: { id: string, count: number }[],
    indexedElements: Map<string, Element>
): void => {
    Promise.all(
        counts.map(c => updateCommentCount(indexedElements[c.id], c.count))
    ).then(() => {
        mediator.emit('modules:commentcount:loaded', counts);
    });
};

const getCommentCounts = (): void => {
    const indexedElements: Map<string, Element> = getElementsIndexedById();
    const endpoint: string = countUrl + getContentIds(indexedElements);

    fetchJSON(endpoint, {
        mode: 'cors',
    }).then(response => {
        if (response && response.counts) {
            renderCounts(response.counts, indexedElements);
        }
    });
};

const init = (): void => {
    if (document.querySelector('[data-discussion-id]')) {
        getCommentCounts();
    }

    // Load new counts when more trails are loaded
    mediator.once('modules:related:loaded', getCommentCounts);
};

export { init, getCommentCounts, getContentIds, getElementsIndexedById };
