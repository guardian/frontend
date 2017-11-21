// @flow
import bonzo from 'bonzo';
import { makeRelativeDate } from 'common/modules/ui/relativedates';
import $ from 'lib/$';
import { getViewport } from 'lib/detect';
import fastdomPromise from 'lib/fastdom-promise';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import { session } from 'lib/storage';
import template from 'lodash/utilities/template';
import blockTemplate from 'raw-loader!facia/views/liveblog-block.html';
import isUndefined from 'lodash/objects/isUndefined';
import debounce from 'lodash/functions/debounce';

const animateDelayMs = 2000;
const animateAfterScrollDelayMs = 500;
let refreshSecs = 30;
const refreshDecay = 1;
let refreshMaxTimes = 5;
const selector = '.js-liveblog-blocks';
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
        relTime = `Latest update ${relTime} ago`;
    } else {
        relTime = 'Updated just now';
    }

    return template(blockTemplate, {
        ariaHidden: !block.isNew,
        href: `/${articleId}#${block.id}`,
        relativeTime: relTime,
        text: [block.title, block.body.slice(0, 500)]
            .filter(x => x != null)
            .join('. '),
        index: index + 1,
    });
};

const maybeAnimateBlocks = (
    el: Element,
    immediate?: boolean
): Promise<boolean> =>
    fastdomPromise
        .read(() => el.getBoundingClientRect().top)
        .then(vPosition => {
            if (vPosition > 0 && vPosition < viewportHeightPx) {
                setTimeout(() => {
                    const $el = bonzo(el);

                    fastdomPromise.write(() => {
                        $el.removeClass(
                            'fc-item__liveblog-blocks__inner--offset'
                        );
                    });
                }, immediate ? 0 : animateDelayMs);
                return true;
            }
            return false;
        });

const animateBlocks = (el: Element): void => {
    maybeAnimateBlocks(el).then(didAnimate => {
        let animateOnScroll;

        if (!didAnimate) {
            animateOnScroll = debounce(() => {
                maybeAnimateBlocks(el, true).then(animated => {
                    if (animated) {
                        mediator.off('window:throttledScroll', animateOnScroll);
                    }
                });
            }, animateAfterScrollDelayMs);

            mediator.on('window:throttledScroll', animateOnScroll);
        }
    });
};

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
            .slice(0, hasNewBlock ? 2 : 1);

        const el = bonzo.create(
            `<div class="${wrapperClasses.join(' ')}">${blocksHtml.join(
                ''
            )}</div>`
        );

        const $element = bonzo(element);

        fastdomPromise
            .write(() => {
                $element.empty().append(el);
            })
            .then(() => {
                if (hasNewBlock) {
                    animateBlocks(el[0]);
                }
            });
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
