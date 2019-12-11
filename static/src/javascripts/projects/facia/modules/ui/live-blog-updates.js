// @flow
import bonzo from 'bonzo';
import { makeRelativeDate } from 'common/modules/ui/relativedates';
import $ from 'lib/$';
import { getViewport } from 'lib/detect';
import fastdomPromise from 'lib/fastdom-promise';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import { session } from 'lib/storage';
import template from 'lodash/template';
import isUndefined from 'lodash/isUndefined';
import debounce from 'lodash/debounce';
import blockTemplate from 'raw-loader!facia/views/liveblog-block.html';

const animateDelayMs = 2000;
const animateAfterScrollDelayMs = 500;
const newUpdateTransitionDelayMs = 150;
let refreshSecs = 30;
const refreshDecay = 1;
let refreshMaxTimes = 5;
const selector = '.js-liveblog-blocks';
const dynamicClass = 'js-liveblog-blocks-dynamic';
const articleIdAttribute = 'data-article-id';
const sessionStorageKey = 'gu.liveblog.block-dates';
const viewportHeightPx = getViewport().height;

type Block = {
    id: string,
    title: string,
    publishedDateTime: number,
    lastUpdatedDateTime: number,
    body: string,
    isNew: boolean, // This is not pulled in from the response, but mutated in this module
};

const blockRelativeTime = (block: Block): string => {
    const pubDate = (block || {}).publishedDateTime;
    const relDate = pubDate ? makeRelativeDate(new Date(pubDate)) : false;
    return relDate || '';
};

const renderBlock = (
    articleId: string,
    block: Block,
    index: number
): string => {
    let relTime = blockRelativeTime(block);

    if (relTime.match(/yesterday/i)) {
        relTime = relTime.toLowerCase();
    } else if (relTime) {
        relTime = `<span class="block-time-prefix">Latest update </span>${relTime} ago`;
    } else {
        relTime = '<span class="block-time-prefix">Updated </span>just now';
    }

    return template(blockTemplate)({
        ariaHidden: !block.isNew,
        href: `/${articleId}#${block.id}`,
        relativeTime: relTime,
        text: [block.title, block.body.slice(0, 500)]
            .filter(x => x != null)
            .join('. '),
        index: index + 1,
    });
};

const timeoutPromise = (delay: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, delay));

const maybeAnimateBlocks = (
    el: Element,
    container: Element,
    immediate?: boolean
): Promise<boolean> =>
    fastdomPromise
        .read(() => el.getBoundingClientRect().top)
        .then(vPosition => {
            const isVisible = vPosition > 0 && vPosition < viewportHeightPx;

            if (isVisible) {
                timeoutPromise(immediate ? 0 : animateDelayMs).then(() =>
                    fastdomPromise.write(() =>
                        el.classList.remove(
                            'fc-item__liveblog-blocks__inner--offset'
                        )
                    )
                );

                return true;
            }
            return false;
        });

const animateBlocks = (el: Element, container: Element): void => {
    maybeAnimateBlocks(el, container).then(didAnimate => {
        if (!didAnimate) {
            const animateOnScroll = debounce(() => {
                maybeAnimateBlocks(el, container, true).then(
                    didAnimateOnScroll => {
                        if (didAnimateOnScroll) {
                            mediator.off(
                                'window:throttledScroll',
                                animateOnScroll
                            );
                        }
                    }
                );
            }, animateAfterScrollDelayMs);

            mediator.on('window:throttledScroll', animateOnScroll);
        }
    });

    fastdomPromise.write(() => {
        container.classList.remove('fc-item__liveblog-blocks--hidden');
        container.classList.add('fc-item__liveblog-blocks--visible');
    });
};

const applyUpdate = (
    container: Element,
    content: Array<Element>
): Promise<void> =>
    fastdomPromise.write(() => {
        bonzo(container)
            .empty()
            .append(content);
    });

const startUpdate = (
    container: Element,
    content: Array<Element>,
    shouldTransitionOut: boolean
): Promise<void> => {
    if (shouldTransitionOut) {
        container.classList.remove('fc-item__liveblog-blocks--visible');
        container.classList.add('fc-item__liveblog-blocks--hidden');

        // Use a timeout here so we don't update the DOM until the transition
        // has completed. There's a relationship here between
        // newUpdateTransitionDelayMs and the transition timings in
        // story-package-garnett.scss.
        return timeoutPromise(newUpdateTransitionDelayMs).then(() =>
            applyUpdate(container, content)
        );
    }

    return applyUpdate(container, content);
};

const completeUpdate = (
    container: Element,
    content: Array<Element>,
    shouldTransitionIn: boolean
): void => {
    if (shouldTransitionIn) {
        animateBlocks(content[0], container);
    }
};

const isDynamic = (element: Element): boolean =>
    element.classList.contains(dynamicClass);

const showBlocks = (
    articleId: string,
    targets: Array<Element>,
    blocks: Array<Block>,
    oldBlockDate: number
): void => {
    const fakeUpdate = isUndefined(oldBlockDate);

    targets.forEach(element => {
        let hasNewBlock = false;

        const wrapperClasses = [
            'fc-item__liveblog-blocks__inner',
            'u-faux-block-link__promote',
        ];

        const blocksHtml = blocks
            .slice(0, 2)
            .map((block, index) => {
                if (
                    !hasNewBlock &&
                    (block.publishedDateTime > oldBlockDate || fakeUpdate)
                ) {
                    block.isNew = true;
                    hasNewBlock = true;
                    wrapperClasses.push(
                        'fc-item__liveblog-blocks__inner--offset'
                    );
                }

                return renderBlock(articleId, block, index);
            })
            .slice(0, hasNewBlock || isDynamic(element) ? 2 : 1);

        const el = bonzo.create(
            `<div class="${wrapperClasses.join(' ')}">${blocksHtml.join(
                ''
            )}</div>`
        );

        startUpdate(element, el, hasNewBlock).then(() =>
            completeUpdate(element, el, hasNewBlock)
        );
    });
};

const sanitizeBlocks = (blocks: Array<Block>): Array<Block> =>
    blocks.filter(
        block =>
            block.id &&
            block.publishedDateTime &&
            block.body &&
            block.body.length >= 10
    );

const showUpdatesFromLiveBlog = (): Promise<void> =>
    fastdomPromise
        .read(() => {
            const elementsById: Map<string, Array<Element>> = new Map();

            // For each liveblock block
            $(selector).each(element => {
                const articleId = element.getAttribute(articleIdAttribute);

                if (articleId) {
                    const elementsForArticle =
                        elementsById.get(articleId) || [];
                    elementsForArticle.push(element);
                    elementsById.set(articleId, elementsForArticle);
                }
            });
            return elementsById;
        })
        .then(elementsById => {
            let oldBlockDates;

            if (elementsById.size) {
                oldBlockDates = session.get(sessionStorageKey) || {};

                elementsById.forEach((elements, articleId) => {
                    fetchJson(`/${articleId}.json?rendered=false`, {
                        mode: 'cors',
                    })
                        .then(response => {
                            const blocks =
                                response && sanitizeBlocks(response.blocks);

                            if (blocks && blocks.length) {
                                showBlocks(
                                    articleId,
                                    elements,
                                    blocks,
                                    oldBlockDates[articleId]
                                );
                                oldBlockDates[articleId] =
                                    blocks[0].publishedDateTime;
                                session.set(sessionStorageKey, oldBlockDates);
                            }
                        })
                        .catch(() => {});
                });

                if (refreshMaxTimes) {
                    refreshMaxTimes -= 1;
                    setTimeout(() => {
                        showUpdatesFromLiveBlog();
                    }, refreshSecs * 1000);
                    refreshSecs *= refreshDecay;
                }
            }
        });

export { showUpdatesFromLiveBlog };
