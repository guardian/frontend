import bonzo from 'bonzo';
import { makeRelativeDate } from 'common/modules/ui/relativedates';
import $ from 'lib/$';
import { getViewport } from 'lib/detect';
import fastdomPromise from 'lib/fastdom-promise';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import { storage } from '@guardian/libs';
import template from 'lodash/template';
import isUndefined from 'lodash/isUndefined';
import debounce from 'lodash/debounce';
import blockTemplate from 'facia/views/liveblog-block.html';

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
const maxBlockCount = 3;


const blockRelativeTime = (block) => {
    const pubDate = (block || {}).publishedDateTime;
    const relDate = pubDate ? makeRelativeDate(new Date(pubDate)) : false;
    return relDate || '';
};

const renderBlock = (
    articleId,
    block,
    index
) => {
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
        href: `/${articleId}#block-${block.id}`,
        relativeTime: relTime,
        text: [block.title, block.body.slice(0, 500)]
            .filter(x => x != null)
            .join('. '),
        index: index + 1,
    });
};

const timeoutPromise = (delay) =>
    new Promise(resolve => setTimeout(resolve, delay));

const maybeAnimateBlocks = (
    el,
    container,
    immediate
) =>
    fastdomPromise
        .measure(() => el.getBoundingClientRect().top)
        .then(vPosition => {
            const isVisible = vPosition > 0 && vPosition < viewportHeightPx;

            if (isVisible) {
                timeoutPromise(immediate ? 0 : animateDelayMs).then(() =>
                    fastdomPromise.mutate(() =>
                        el.classList.remove(
                            'fc-item__liveblog-blocks__inner--offset'
                        )
                    )
                );

                return true;
            }
            return false;
        });

const animateBlocks = (el, container) => {
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

    fastdomPromise.mutate(() => {
        container.classList.remove('fc-item__liveblog-blocks--hidden');
        container.classList.add('fc-item__liveblog-blocks--visible');
    });
};

const applyUpdate = (
    container,
    content
) =>
    fastdomPromise.mutate(() => {
        bonzo(container)
            .empty()
            .append(content);
    });

const startUpdate = (
    container,
    content,
    shouldTransitionOut
) => {
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
    container,
    content,
    shouldTransitionIn
) => {
    if (shouldTransitionIn) {
        animateBlocks(content[0], container);
    }
};

const isDynamic = (element) =>
    element.classList.contains(dynamicClass);

const calculateBlockCount = (
    hasNewBlock,
    isInDynamicContainer
) => {
    if (isInDynamicContainer) {
        return maxBlockCount;
    } else if (hasNewBlock) {
        return 2;
    }
    return 1;
};

const showBlocks = (
    articleId,
    targets,
    blocks,
    oldBlockDate
) => {
    const fakeUpdate = isUndefined(oldBlockDate);

    targets.forEach(element => {
        let hasNewBlock = false;

        const wrapperClasses = [
            'fc-item__liveblog-blocks__inner',
            'u-faux-block-link__promote',
        ];

        const blocksHtml = blocks
            .slice(0, maxBlockCount)
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
            .slice(0, calculateBlockCount(hasNewBlock, isDynamic(element)));

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

const sanitizeBlocks = (blocks) =>
    blocks.filter(
        block =>
            block.id &&
            block.publishedDateTime &&
            block.body &&
            block.body.length >= 10
    );

const showUpdatesFromLiveBlog = () =>
    fastdomPromise
        .measure(() => {
            const elementsById = new Map();

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
                oldBlockDates = storage.session.get(sessionStorageKey) || {};

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
                                storage.session.set(sessionStorageKey, oldBlockDates);
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
