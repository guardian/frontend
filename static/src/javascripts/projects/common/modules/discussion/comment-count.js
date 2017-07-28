// @flow
import fastdom from 'lib/fastdom-promise';
import fetchJSON from 'lib/fetch-json';
import { integerCommas } from 'lib/formatters';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import { addClassesAndTitle } from 'common/views/svg';
import commentCount16icon from 'svgs/icon/comment-16.svg';
import commentCountTemplate from 'raw-loader!common/views/discussion/comment-count.html';
import commentCountContentTemplate from 'raw-loader!common/views/discussion/comment-count--content.html';
import commentCountContentImmersiveTemplate from 'raw-loader!common/views/discussion/comment-count--content-immersive.html';

type Map<K, V> = { [k: K]: V };

const attributeName = 'data-discussion-id';
const countUrl = '/discussion/comment-counts.json?shortUrls=';
const templates = {
    content: commentCountContentTemplate,
    contentImmersive: commentCountContentImmersiveTemplate,
};
const defaultTemplate = commentCountTemplate;

const getElementsIndexedById = (
    context: Element | Document
): Map<string, Element[]> => {
    const elements: Element[] = Array.from(
        context.querySelectorAll(`[${attributeName}]`)
    );

    return elements.reduce((acc, el) => {
        const key = el.getAttribute(attributeName);
        if (!key) return acc;
        return Object.freeze(
            Object.assign(
                {},
                acc,
                acc[key] ? { [key]: acc[key].concat(el) } : { [key]: [el] }
            )
        );
    }, {});
};

const getContentIds = (indexedElements: Map<string, Element[]>): string =>
    Object.keys(indexedElements).sort().join(',');

const getContentUrl = (node: Element): string =>
    Array.from(node.getElementsByTagName('a'))
        .slice(0, 1)
        .map(a => `${a ? a.pathname : ''}#comments`)
        .join('');

const renderCounts = (
    counts: { id: string, count: number }[],
    indexedElements: Map<string, Element[]>
) => {
    Promise.all(
        counts.map(
            c =>
                indexedElements[c.id]
                    ? Promise.all(
                          indexedElements[c.id].map((node: Element): Promise<
                              void
                          > => {
                              const url =
                                  node.getAttribute('data-discussion-url') ||
                                  getContentUrl(node);

                              if (
                                  node.getAttribute(
                                      'data-discussion-closed'
                                  ) === 'true' &&
                                  c.count === 0
                              ) {
                                  // Discussion is closed and had no comments, we don't want to show a comment count
                                  return Promise.resolve();
                              }

                              const format = node.getAttribute(
                                  'data-commentcount-format'
                              );
                              const html = template(
                                  (format && templates[format]) ||
                                      defaultTemplate,
                                  {
                                      url,
                                      icon: addClassesAndTitle(
                                          commentCount16icon.markup,
                                          ['inline-tone-fill']
                                      ),
                                      count: integerCommas(c.count),
                                  }
                              );

                              const meta = node.querySelector('.js-item__meta');
                              const container = meta || node;

                              return fastdom.write(() => {
                                  container.insertAdjacentHTML(
                                      'beforeend',
                                      html
                                  );
                                  node.removeAttribute(attributeName);
                                  node.classList.remove('u-h');
                              });
                          })
                      )
                    : Promise.resolve()
        )
    ).then(() => {
        mediator.emit('modules:commentcount:loaded', counts);
    });
};

const getCommentCounts = (context: Element | Document = document): void => {
    const indexedElements: Map<string, Element[]> = getElementsIndexedById(
        context
    );
    const endpoint: string = countUrl + getContentIds(indexedElements);

    fetchJSON(endpoint, {
        mode: 'cors',
    }).then(response => {
        if (response && response.counts) {
            renderCounts(response.counts, indexedElements);
        }
    });
};

const init = () => {
    if (document.querySelector('[data-discussion-id]')) {
        getCommentCounts();
    }

    // Load new counts when more trails are loaded
    mediator.once('modules:related:loaded', getCommentCounts);
};

export { init, getCommentCounts, getContentIds, getElementsIndexedById };
