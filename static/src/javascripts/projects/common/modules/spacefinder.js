// @flow

// total_hours_spent_maintaining_this = 65

import qwery from 'qwery';
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import memoize from 'lodash/functions/memoize';

type SpacefinderOptions = {
    waitForAds?: boolean,
    waitForLinks?: boolean,
    waitForImages?: boolean,
    waitForInteractives?: boolean,
};

type SpacefinderItem = {
    top: number,
    bottom: number,
    element: Element,
};

type SpacefinderExclusion = {
    minAbove: number,
    minBelow: number,
};

type SpacefinderRules = {
    bodySelector: string,
    body?: Node,
    slotSelector: string,
    // minimum from slot to top of page
    absoluteMinAbove?: number,
    // minimum from para to top of article
    minAbove: number,
    // minimum from (top of) para to bottom of article
    minBelow: number,
    // vertical px to clear the content meta element (byline etc) by. 0 to ignore
    clearContentMeta: number,
    // custom rules using selectors.
    selectors: {
        [k: string]: SpacefinderExclusion,
    },
    // will run each slot through this fn to check if it must be counted in
    filter?: (x: Element, y: number, z: Element[]) => boolean,
    // will remove slots before this one
    startAt?: Element,
    // will remove slots from this one on
    stopAt?: Element,
    // will reverse the order of slots (this is useful for lazy loaded content)
    fromBottom?: boolean,
};

// maximum time (in ms) to wait for images to be loaded and rich links
// to be upgraded
const LOADING_TIMEOUT = 5000;

const defaultOptions: SpacefinderOptions = {
    waitForImages: true,
    waitForLinks: true,
    waitForInteractives: false,
    waitForAds: false,
};

const isIframe = (node: Element): boolean => node instanceof HTMLIFrameElement;

const isIframeLoaded = (iframe: HTMLIFrameElement): boolean => {
    try {
        return (
            iframe.contentWindow &&
            iframe.contentWindow.document &&
            iframe.contentWindow.document.readyState === 'complete'
        );
    } catch (err) {
        return true;
    }
};

const expire = (resolve: () => void): void => {
    window.setTimeout(resolve, LOADING_TIMEOUT);
};

const getFuncId = (rules: SpacefinderRules): string =>
    rules.bodySelector || 'document';

const onImagesLoaded = memoize((rules: SpacefinderRules): Promise<void> => {
    const notLoaded: HTMLImageElement[] = qwery('img', rules.body).filter(
        img => !img.complete
    );

    return notLoaded.length === 0
        ? Promise.resolve()
        : new Promise(resolve => {
              let loadedCount = 0;
              bean.on(rules.body, 'load', notLoaded, function onImgLoaded() {
                  loadedCount += 1;
                  if (loadedCount === notLoaded.length) {
                      bean.off(rules.body, 'load', onImgLoaded);
                      notLoaded.length = 0;
                      resolve();
                  }
              });
          });
}, getFuncId);

const onRichLinksUpgraded = memoize(
    (rules: SpacefinderRules): Promise<void> =>
        qwery('.element-rich-link--not-upgraded', rules.body).length === 0
            ? Promise.resolve()
            : new Promise(resolve => {
                  mediator.once('rich-link:loaded', resolve);
              }),
    getFuncId
);

const onInteractivesLoaded = memoize((rules: SpacefinderRules): Promise<
    void
> => {
    const notLoaded: Element[] = qwery(
        '.element-interactive',
        rules.body
    ).filter((interactive: Element): boolean => {
        const iframe: HTMLIFrameElement[] = ([...interactive.children].filter(
            isIframe
        ): any[]);
        return !(iframe.length && isIframeLoaded(iframe[0]));
    });

    return notLoaded.length === 0 || !('MutationObserver' in window)
        ? Promise.resolve()
        : Promise.all(
              notLoaded.map(
                  (interactive: Element): Promise<void> =>
                      new Promise(resolve => {
                          new MutationObserver(
                              (
                                  records: MutationRecord[],
                                  instance: MutationObserver
                              ): void => {
                                  if (
                                      !records.length ||
                                      !records[0].addedNodes.length ||
                                      !isIframe((records[0].addedNodes[0]: any))
                                  ) {
                                      return;
                                  }

                                  const iframe = records[0].addedNodes[0];
                                  if (isIframeLoaded((iframe: any))) {
                                      instance.disconnect();
                                      resolve();
                                  } else {
                                      iframe.addEventListener('load', () => {
                                          instance.disconnect();
                                          resolve();
                                      });
                                  }
                              }
                          ).observe(interactive, {
                              childList: true,
                          });
                      })
              )
          ).then(() => undefined);
}, getFuncId);

const onAdsLoaded = memoize(
    (rules: SpacefinderRules): Promise<boolean[]> =>
        Promise.all(
            qwery('.js-ad-slot', rules.body).map(ad => ad.id).map(trackAdRender)
        ),
    getFuncId
);

// test one element vs another for the given rules
const testCandidate = (
    rules: SpacefinderExclusion,
    challenger: SpacefinderItem,
    opponent: SpacefinderItem
): boolean => {
    const isMinAbove = challenger.top - opponent.bottom >= rules.minAbove;
    const isMinBelow = opponent.top - challenger.top >= rules.minBelow;

    return isMinAbove || isMinBelow;
};

// test one element vs an array of other elements for the given rules
const testCandidates = (
    rules: SpacefinderExclusion,
    challenger: SpacefinderItem,
    opponents: SpacefinderItem[]
): boolean => opponents.every(testCandidate.bind(undefined, rules, challenger));

const mapElementToComputedDimensions = (el: Element): SpacefinderItem => {
    const rect = el.getBoundingClientRect();
    return Object.freeze({
        top: rect.top,
        bottom: rect.bottom,
        element: el,
    });
};

const mapElementToDimensions = (el: HTMLElement): SpacefinderItem =>
    Object.freeze({
        top: el.offsetTop,
        bottom: el.offsetTop + el.offsetHeight,
        element: el,
    });

const enforceRules = (
    data: Object,
    rules: SpacefinderRules
): SpacefinderItem[] => {
    let { candidates } = data;

    // enforce absoluteMinAbove rule
    if (rules.absoluteMinAbove) {
        candidates = candidates.filter(
            candidate => candidate.top >= rules.absoluteMinAbove
        );
    }

    // enforce minAbove and minBelow rules
    candidates = candidates.filter(candidate => {
        const farEnoughFromTopOfBody = candidate.top >= rules.minAbove;
        const farEnoughFromBottomOfBody =
            candidate.top + rules.minBelow <= data.bodyHeight;
        return farEnoughFromTopOfBody && farEnoughFromBottomOfBody;
    });

    // enforce content meta rule
    if (rules.clearContentMeta) {
        candidates = candidates.filter(
            c => c.top > data.contentMeta.bottom + rules.clearContentMeta
        );
    }

    // enforce selector rules
    if (rules.selectors) {
        Object.keys(rules.selectors).forEach(selector => {
            candidates = candidates.filter(candidate =>
                testCandidates(
                    rules.selectors[selector],
                    candidate,
                    data.opponents[selector]
                )
            );
        });
    }

    if (rules.filter) {
        candidates = candidates.filter(rules.filter, rules);
    }

    return candidates;
};

class SpaceError extends Error {
    name: string;
    message: string;

    constructor(rules: SpacefinderRules) {
        super();
        this.name = 'SpaceError';
        this.message = `There is no space left matching rules from ${rules.bodySelector}`;
    }
}

const getReady = (
    rules: SpacefinderRules,
    options: SpacefinderOptions
): Promise<SpacefinderRules> =>
    Promise.race([
        new Promise(expire),
        Promise.all([
            options.waitForImages ? onImagesLoaded(rules) : true,
            options.waitForLinks ? onRichLinksUpgraded(rules) : true,
            options.waitForInteractives ? onInteractivesLoaded(rules) : true,
            options.waitForAds ? onAdsLoaded(rules) : true,
        ]),
    ]).then(() => rules);

const getCandidates = (rules: SpacefinderRules): Element[] => {
    let candidates: Element[] = qwery(rules.bodySelector + rules.slotSelector);
    if (rules.fromBottom) {
        candidates.reverse();
    }
    if (rules.startAt) {
        let drop = true;
        candidates = candidates.filter(candidate => {
            if (candidate === rules.startAt) {
                drop = false;
            }
            return !drop;
        });
    }
    if (rules.stopAt) {
        let keep = true;
        candidates = candidates.filter(candidate => {
            if (candidate === rules.stopAt) {
                keep = false;
            }
            return keep;
        });
    }
    return candidates;
};

const getMeasurements = (
    rules,
    candidates: Element[],
    getDimensions: (x: HTMLElement) => SpacefinderItem
): Promise<Object> => {
    const contentMeta: ?Element = rules.clearContentMeta
        ? document.querySelector('.js-content-meta')
        : null;
    const opponents = rules.selectors
        ? Object.keys(rules.selectors).map(selector => [
              selector,
              qwery(rules.bodySelector + selector),
          ])
        : null;

    return fastdom.read(() => {
        const bodyDims =
            rules.body instanceof Element && rules.body.getBoundingClientRect();
        const candidatesWithDims = (candidates: any[]).map(getDimensions);
        const contentMetaWithDims = rules.clearContentMeta
            ? getDimensions((contentMeta: any))
            : null;
        const opponentsWithDims = opponents
            ? opponents.reduce((result, selectorAndElements) => {
                  result[selectorAndElements[0]] = selectorAndElements[1].map(
                      getDimensions
                  );
                  return result;
              }, {})
            : null;

        if (rules.body && rules.absoluteMinAbove) {
            rules.absoluteMinAbove -= (bodyDims && bodyDims.top) || 0;
        }

        return {
            bodyHeight: bodyDims.height || 0,
            candidates: candidatesWithDims,
            contentMeta: contentMetaWithDims,
            opponents: opponentsWithDims,
        };
    });
};

const returnCandidates = (
    rules: SpacefinderRules,
    candidates: SpacefinderItem[]
): Element[] => {
    if (!candidates.length) {
        throw new SpaceError(rules);
    }
    return candidates.map(candidate => candidate.element);
};

// Rather than calling this directly, use spaceFiller to inject content into the page.
// SpaceFiller will safely queue up all the various asynchronous DOM actions to avoid any race conditions.
const findSpace = (
    rules: SpacefinderRules,
    options?: SpacefinderOptions
): Promise<Element[]> => {
    const getDimensions = rules.absoluteMinAbove
        ? mapElementToComputedDimensions
        : mapElementToDimensions;

    rules.body =
        (rules.bodySelector && document.querySelector(rules.bodySelector)) ||
        document;

    return getReady(rules, options || defaultOptions)
        .then(getCandidates)
        .then(candidates => getMeasurements(rules, candidates, getDimensions))
        .then(data => enforceRules(data, rules))
        .then(winners => returnCandidates(rules, winners));
};

export const _ = {
    testCandidate, // exposed for unit testing
    testCandidates, // exposed for unit testing
};

export { findSpace, SpaceError };
