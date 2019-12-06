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

const FAKE_UPDATES = true;

const fakeBlocks = {
    blocks: [
        {
            id: '5de7825e8f08bf648cb238bf',
            title: null,
            publishedDateTime: 1575453406000,
            lastUpdatedDateTime: 1575453406000,
            body:
                'President Trump has now posed for a photograph with Boris Johnson. It came after Johnson and Jens Stoltenberg, the Nato secretary general, formally welcomed him to the summit. Johnson and Stoltenberg had a handshake and picture with every Nato leader one by one, ahead of the “family photo” taking place about now.',
        },
        {
            id: '5de780e48f08f78465b4aa89',
            title: null,
            publishedDateTime: 1575453224000,
            lastUpdatedDateTime: 1575453224000,
            body:
                'On his arrival at the Nato summit the French president, Emmanuel Macron, defended his recent claim that the organisation was experiencing “brain death”. Asked if he still stood by the comment, he replied: Yes, absolutely. In fact it allowed us to raise some crucial debates. He said those included how to create a durable peace in Europe and clarifying who was the enemy. So I think it was our responsibility to raise ambiguities that could be harmful, and to tackle a real strategic debate. It has started, I am satisfied.',
        },
        {
            id: '5de77f098f0829bc521b6332',
            title: "STV's Scottish leaders' debate last night - Summary",
            publishedDateTime: 1575452744000,
            lastUpdatedDateTime: 1575453457000,
            body:
                'If you’re a UK viewer living outside Scotland, and feeling deprived of your leaders’ debate fix last night, then read on. It’s fair to say that STV’s debate between the Scottish party leaders – excluding Patrick Harvie of the Scottish Greens, bizarrely – was rather a shout-fest, although it was refreshing to see Nicola Sturgeon properly interrogated on Holyrood policy, which seldom happens when she takes part in the UK-wide debates. But of course that’s because education, health and so on are devolved - so while it was good to see those areas covered, they are not technically relevant to a UK general election. The format, which really felt its lack of a live audience, involved a series of questions and interrogations of each leader by the other politicians, rather than by the host Colin Mackay, and so leant itself to people (men, Sturgeon was the only woman there) talking across one another. At one point I looked up from my notes to see the Scottish Conservatives’ Jackson Carlaw shouting at Lib Dems’ Willie Rennie, Rennie shouting at Labour’s Richard Leonard, and Sturgeon standing there with her arms folded like a teacher who has already tried multiple time-outs with the kids and is now just waiting for the lunch bell to go. Some interesting points: Tory leader Carlaw urged viewers to “lend us your vote to stop indyref2”, clearly the anti-independence message is working as well for the Scottish Tories, if not better than getting Brexit done. Challenged on Boris Johnson’s previous remarks about Muslim women and gay men, he admitted they were “completely unacceptable” but insisted he would judge him on his performance in office. Carlaw and Rennie attacked Labour’s “clear as mud” position on Brexit, mocking leader Richard Leonard for being “constantly over-ruled” by Jeremy Corbyn. Leonard struggled to answer the charge that voters didn’t trust Corbyn to stand up for the union. Sturgeon failed to offer a Plan B if a new Tory (or Labour) government refused her demand for the powers to hold a second independence referendum next year. Challenged on putting independence before public services, her defence of the latest Pisa report, which saw Scotland achieve its lowest scores in maths and science since it first took part in the survey almost 20 years ago and reported that pupils’ performance in reading tests had recovered only to the level it was at in 2012, was weak. But at least it prompted the zingiest response of the debate from Willie Rennie: If you are telling me that a line on a chart going down is optimistic, then the problem of numeracy in your government goes right to the top.',
        },
        {
            id: '5de77e188f08bf648cb2389f',
            title: null,
            publishedDateTime: 1575452289000,
            lastUpdatedDateTime: 1575452289000,
            body:
                'Boris Johnson, or whoever controls his Twitter account, has just posted a picture of the PM meeting a blonde-haired admirer yesterday. But not that one ...',
        },
        {
            id: '5de77de18f08f78465b4aa77',
            title: null,
            publishedDateTime: 1575452161000,
            lastUpdatedDateTime: 1575452161000,
            body:
                'President Trump has also retweeted the group photograph from last night.',
        },
        {
            id: '5de77d9e8f08f78465b4aa75',
            title: null,
            publishedDateTime: 1575452102000,
            lastUpdatedDateTime: 1575452102000,
            body:
                'President Trump has tweeted about his meeting with Boris Johnson last night. But he hasn’t included a picture.',
        },
    ],
    refreshStatus: false,
};

const animateDelayMs = 2000;
const animateAfterScrollDelayMs = 500;
const newUpdateTransitionDelayMs = 150;
let refreshSecs = 7;
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

const applyUpdate = (container: Element, content: Element): Promise<void> =>
    fastdomPromise.write(() => {
        bonzo(container)
            .empty()
            .append(content);
    });

const startUpdate = (
    container: Element,
    content: Element,
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
    content: Element,
    shouldTransitionIn: boolean
): void => {
    if (shouldTransitionIn) {
        animateBlocks(content[0], container);
    }
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

        startUpdate(element, el, hasNewBlock).then(() =>
            completeUpdate(element, el, hasNewBlock)
        );
    });
};

const sanitizeBlocks = (blocks: Array<Block>): Array<Block> => {
    const newBlocks = blocks.filter(
        block =>
            block.id &&
            block.publishedDateTime &&
            block.body &&
            block.body.length >= 10
    );

    if (FAKE_UPDATES) {
        const randomId = Math.random()
            .toString(36)
            .substring(7);

        const newBlock = {
            ...newBlocks[0],
            publishedDateTime: Date.now(),
            id: randomId,
            body: `${randomId} ${newBlocks[0].body}`,
        };
        newBlocks.unshift(newBlock);
    }

    return newBlocks;
};

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
                    const fetchBlocks = FAKE_UPDATES
                        ? Promise.resolve(fakeBlocks)
                        : fetchJson(`/${articleId}.json?rendered=false`, {
                              mode: 'cors',
                          });

                    fetchBlocks
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
