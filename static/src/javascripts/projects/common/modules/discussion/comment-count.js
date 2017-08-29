// @flow
import fastdom from 'lib/fastdom-promise';
import fetchJSON from 'lib/fetch-json';
import { integerCommas } from 'lib/formatters';
import mediator from 'lib/mediator';
import { inlineSvg } from 'common/views/svgs';

type IndexedElements = { string: HTMLElement } | {};

const ATTRIBUTE_NAME: string = 'data-discussion-id';
const COUNT_URL: string = '/discussion/comment-counts.json?shortUrls=';

const getTemplate = (
    vals: { url: string, icon: string, count: string },
    type: string
): string => {
    const { url, icon, count } = vals;

    if (type === 'content') {
        return `<a href="${url}" data-link-name="Comment count" class="commentcount2 tone-colour">
                    <h3 class="commentcount2__heading">${icon} <span class ="commentcount2__text u-h">Comments</span></h3>
                    <span class="commentcount2__value tone-colour js_commentcount_actualvalue">${count}</span>
                </a>`;
    }

    if (type === 'contentImmersive') {
        return `<a href="${url}" data-link-name="Comment count" class="commentcount2 tone-colour">
                    ${icon}<span class="commentcount__value">${count}</span> Comments
                </a>`;
    }

    return `<a class="fc-trail__count fc-trail__count--commentcount" href="${url}" data-link-name="Comment count">${icon} ${count}</a>`;
};

const getElementsIndexedById = (
    context: HTMLElement
): Promise<IndexedElements> =>
    fastdom
        .read(() => context.querySelectorAll(`[${ATTRIBUTE_NAME}]`))
        .then(elements =>
            [
                ...elements,
            ].reduce((groupedVals: Object, el: HTMLElement): Object => {
                const attrVal = el.getAttribute(ATTRIBUTE_NAME);

                if (!groupedVals[attrVal]) {
                    groupedVals[attrVal] = [];
                }

                groupedVals[attrVal].push(el);

                return groupedVals;
            }, {})
        );

const getContentIds = (indexedElements: Object): string =>
    Object.keys(indexedElements).sort().join(',');

const getContentUrl = (el: HTMLElement): string => {
    const a = el.getElementsByTagName('a')[0];

    return `${a ? a.pathname : ''}#comments`;
};

const updateElement = (el: HTMLElement, count: number): Promise<void> => {
    const url = el.getAttribute('data-discussion-url') || getContentUrl(el);

    if (el.getAttribute('data-discussion-closed') === 'true' && count === 0) {
        // Discussion is closed and had no comments, we don't want to show a comment count
        return Promise.resolve();
    }

    const format = el.getAttribute('data-commentcount-format') || '';
    const html = getTemplate(
        {
            url,
            icon: inlineSvg('commentCount16icon', ['inline-tone-fill']),
            count: integerCommas(count) || '',
        },
        format
    );
    const meta = el.getElementsByClassName('js-item__meta');
    const containers = meta.length ? [...meta] : [el];

    return fastdom.write(() => {
        containers.forEach(container => {
            container.insertAdjacentHTML('beforeend', html);
        });
        el.removeAttribute(ATTRIBUTE_NAME);
        el.classList.remove('u-h');
    });
};

const renderCounts = (
    counts: Array<{ id: string, count: number }>,
    indexedElements: IndexedElements
): Promise<void> => {
    const elementUpdates = counts.map(c =>
        indexedElements[c.id].map(el => updateElement(el, c.count))
    );

    return Promise.all(elementUpdates).then(() => {
        mediator.emit('modules:commentcount:loaded', counts);
    });
};

const getCommentCounts = (context: HTMLElement): Promise<void> =>
    getElementsIndexedById(context || document.body).then(indexedElements => {
        const endpoint = `${COUNT_URL}${getContentIds(indexedElements)}`;

        return fetchJSON(endpoint, {
            mode: 'cors',
        }).then(response => {
            if (response && response.counts) {
                return renderCounts(response.counts, indexedElements);
            }
        });
    });

const init = (): Promise<void> => {
    if (document.body && document.body.querySelector('[data-discussion-id]')) {
        return getCommentCounts(document.body);
    }

    // Load new counts when more trails are loaded
    mediator.on('modules:related:loaded', getCommentCounts);

    return Promise.resolve();
};

export default {
    init,
};
