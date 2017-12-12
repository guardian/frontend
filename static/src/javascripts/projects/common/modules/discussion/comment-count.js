// @flow
import fastdom from 'lib/fastdom-promise';
import fetchJSON from 'lib/fetch-json';
import { integerCommas } from 'lib/formatters';
import mediator from 'lib/mediator';
import { inlineSvg } from 'common/views/svgs';

type IndexedElements = { string: Array<HTMLElement> };

const ATTRIBUTE_NAME: string = 'data-discussion-id';
const COUNT_URL: string = '/discussion/comment-counts.json?shortUrls=';

const getTemplate = (
    vals: { url: string, icon: string, count: string },
    type: string
): string => {
    const { url, icon, count } = vals;

    if (type === 'content') {
        return `<a href="${
            url
        }" data-link-name="Comment count" class="commentcount2 tone-colour">
                    <h3 class="commentcount2__heading">${
                        icon
                    } <span class ="commentcount2__text u-h">Comments</span></h3>
                    <span class="commentcount2__value tone-colour js_commentcount_actualvalue">${
                        count
                    }</span>
                </a>`;
    }

    if (type === 'contentImmersive') {
        return `<a href="${
            url
        }" data-link-name="Comment count" class="commentcount2 tone-colour">
                    ${icon}<span class="commentcount__value">${
            count
        }</span> Comments
                </a>`;
    }

    return `<a class="fc-trail__count fc-trail__count--commentcount" href="${
        url
    }" data-link-name="Comment count">${icon} ${count}</a>`;
};

const getElementsIndexedById = (context: HTMLElement): Promise<any> =>
    fastdom
        .read(() => context.querySelectorAll(`[${ATTRIBUTE_NAME}]`))
        .then(elements => {
            if (elements.length === 0) {
                return;
            }

            return [...elements].reduce(
                (groupedVals: Object, el: HTMLElement): Object => {
                    const attrVal = el.getAttribute(ATTRIBUTE_NAME);

                    if (!groupedVals[attrVal]) {
                        groupedVals[attrVal] = [];
                    }

                    groupedVals[attrVal].push(el);

                    return groupedVals;
                },
                {}
            );
        });

const getContentIds = (indexedElements: IndexedElements): string =>
    Object.keys(indexedElements)
        .sort()
        .join(',');

const getContentUrl = (el: HTMLElement): string => {
    const a = el.getElementsByTagName('a')[0];

    return `${a ? a.pathname : ''}#comments`;
};

const updateElement = (el: HTMLElement, count: number): Promise<void> => {
    const url = el.dataset.discussionUrl || getContentUrl(el);

    if (el.dataset.discussionClosed === 'true' && count === 0) {
        // Discussion is closed and had no comments, we don't want to show a comment count
        return Promise.resolve();
    }

    const format = el.dataset.commentcountFormat || '';
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
): Promise<any> => {
    const elementUpdates = counts.map(c =>
        indexedElements[c.id].map(el => updateElement(el, c.count))
    );

    return Promise.all(elementUpdates);
};

const getCommentCounts = (context?: HTMLElement): Promise<void> => {
    const queryContext: ?HTMLElement = context || document.body;

    if (queryContext) {
        return getElementsIndexedById(queryContext).then(indexedElements => {
            if (!indexedElements) {
                return;
            }

            const endpoint = `${COUNT_URL}${getContentIds(indexedElements)}`;

            return fetchJSON(endpoint, {
                mode: 'cors',
            }).then(response => {
                if (response && response.counts) {
                    return renderCounts(response.counts, indexedElements);
                }
            });
        });
    }

    return Promise.resolve();
};

const init = (): Promise<void> => {
    mediator.on('modules:related:loaded', getCommentCounts);

    return getCommentCounts();
};

export default {
    init,
};
