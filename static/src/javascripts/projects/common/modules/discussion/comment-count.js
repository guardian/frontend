import fastdom from 'lib/fastdom-promise';
import { fetchJson } from 'lib/fetch-json';
import { integerCommas } from 'lib/formatters';
import { mediator } from 'lib/mediator';
import { inlineSvg } from 'common/views/svgs';


const ATTRIBUTE_NAME = 'data-discussion-id';
const COUNT_URL = '/discussion/comment-counts.json?shortUrls=';

const getTemplate = (
    vals,
    type
) => {
    const { url, icon, count } = vals;

    if (type === 'content') {
        return `<a href="${url}" data-link-name="Comment count" class="commentcount2 tone-colour" aria-label="${count} comments">
                    <h3 class="commentcount2__heading">${icon} <span class ="commentcount2__text u-h">Comments</span></h3>
                    <span class="commentcount2__value tone-colour js_commentcount_actualvalue">${count}</span>
                </a>`;
    }

    return `<a class="fc-trail__count fc-trail__count--commentcount" href="${url}" data-link-name="Comment count" aria-label="${count} comments">${icon} ${count}</a>`;
};

const getElementsIndexedById = (context) =>
    fastdom
        .measure(() => Array.from(context.querySelectorAll(`[${ATTRIBUTE_NAME}]`)))
        .then(elements => {
            if (elements.length === 0) {
                return;
            }

            return elements.reduce(
                (groupedVals, el) => {
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

const getContentIds = (indexedElements) =>
    Object.keys(indexedElements)
        .sort()
        .join(',');

const getContentUrl = (el) => {
    const a = el.getElementsByTagName('a')[0];

    return `${a ? a.pathname : ''}#comments`;
};

const updateElement = (el, count) => {
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
            count: integerCommas(count, true) || '',
        },
        format
    );
    const meta = Array.from(el.getElementsByClassName('js-item__meta'));
    const containers = meta.length ? meta : [el];

    return fastdom.mutate(() => {
        containers.forEach(container => {
            container.insertAdjacentHTML('beforeend', html);
        });
        el.removeAttribute(ATTRIBUTE_NAME);
        el.classList.remove('u-h');
    });
};

const renderCounts = (
    counts,
    indexedElements
) => {
    const elementUpdates = counts.map(c =>
        indexedElements[c.id].map(el => updateElement(el, c.count))
    );

    return Promise.all(elementUpdates);
};

const getCommentCounts = (context) => {
    const queryContext = context || document.body;

    if (queryContext) {
        return getElementsIndexedById(queryContext).then(indexedElements => {
            if (!indexedElements) {
                return;
            }

            const endpoint = `${COUNT_URL}${getContentIds(indexedElements)}`;

            return fetchJson(endpoint, {
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

export const initCommentCount = () => {
    mediator.on('modules:related:loaded', getCommentCounts);

    return getCommentCounts();
};
