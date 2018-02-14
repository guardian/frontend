// @flow

// total_hours_spent_maintaining_this = 70

import qwery from 'qwery';
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import memoize from 'lodash/functions/memoize';

type SpacefinderOptions = {
    waitForLinks?: boolean,
    waitForImages?: boolean,
    waitForInteractives?: boolean,
};

export type SpacefinderItem = {
    top: number,
    bottom: number,
    element: Element,
};

type RuleSpacing = {
    minAbove: number,
    minBelow: number,
};

type ElementDimensionMap = {
    [name: string]: SpacefinderItem[],
};

type Measurements = {
    bodyTop: number,
    bodyHeight: number,
    candidates: SpacefinderItem[],
    contentMeta: ?SpacefinderItem,
    opponents: ?ElementDimensionMap,
};

export type SpacefinderRules = {
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
        [k: string]: RuleSpacing,
    },
    // will run each slot through this fn to check if it must be counted in
    filter?: (x: SpacefinderItem, y: number, z: SpacefinderItem[]) => boolean,
    // will remove slots before this one
    startAt?: Element,
    // will remove slots from this one on
    stopAt?: Element,
    // will reverse the order of slots (this is useful for lazy loaded content)
    fromBottom?: boolean,
};

export type SpacefinderExclusions = {
    [ruleName: string]: Element[],
};

// maximum time (in ms) to wait for images to be loaded and rich links
// to be upgraded
const LOADING_TIMEOUT = 5000;

const defaultOptions: SpacefinderOptions = {
    waitForImages: true,
    waitForLinks: true,
    waitForInteractives: false,
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

// test one element vs another for the given rules
const testCandidate = (
    rule: RuleSpacing,
    challenger: SpacefinderItem,
    opponent: SpacefinderItem
): boolean => {
    const isMinAbove = challenger.top - opponent.bottom >= rule.minAbove;
    const isMinBelow = opponent.top - challenger.top >= rule.minBelow;

    return isMinAbove || isMinBelow;
};

// test one element vs an array of other elements for the given rules
const testCandidates = (
    rules: RuleSpacing,
    challenger: SpacefinderItem,
    opponents: SpacefinderItem[]
): boolean => opponents.every(testCandidate.bind(undefined, rules, challenger));

const enforceRules = (
    data: Measurements,
    rules: SpacefinderRules,
    exclusions: SpacefinderExclusions
): SpacefinderItem[] => {
    let { candidates } = data;

    // enforce absoluteMinAbove rule
    candidates = candidates.filter(
        candidate =>
            rules.absoluteMinAbove &&
            candidate.top + data.bodyTop >= rules.absoluteMinAbove
    );

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
            c =>
                data.contentMeta &&
                c.top > data.contentMeta.bottom + rules.clearContentMeta
        );
    }

    // enforce selector rules
    if (rules.selectors) {
        Object.keys(rules.selectors).forEach(selector => {
            candidates = candidates.filter(candidate =>
                testCandidates(
                    rules.selectors[selector],
                    candidate,
                    data.opponents ? data.opponents[selector] : []
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
        this.message = `There is no space left matching rules from ${
            rules.bodySelector
        }`;
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
        ]),
    ]).then(() => rules);

const getCandidates = (
    rules: SpacefinderRules,
    exclusions: SpacefinderExclusions
): HTMLElement[] => {
    let candidates: HTMLElement[] = qwery(
        rules.bodySelector + rules.slotSelector
    );
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

const getDimensions = (el: HTMLElement): SpacefinderItem =>
    Object.freeze({
        top: el.offsetTop,
        bottom: el.offsetTop + el.offsetHeight,
        element: el,
    });

const getMeasurements = (
    rules,
    candidates: HTMLElement[]
): Promise<Measurements> => {
    const contentMeta: ?HTMLElement = rules.clearContentMeta
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
        const candidatesWithDims: SpacefinderItem[] = candidates.map(
            getDimensions
        );
        const contentMetaWithDims: ?SpacefinderItem =
            rules.clearContentMeta && contentMeta
                ? getDimensions(contentMeta)
                : null;
        const opponentsWithDims: ?ElementDimensionMap = opponents
            ? opponents.reduce((result, selectorAndElements) => {
                  result[selectorAndElements[0]] = selectorAndElements[1].map(
                      getDimensions
                  );
                  return result;
              }, {})
            : null;

        return {
            bodyTop: bodyDims.top || 0,
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
    options: ?SpacefinderOptions
): Promise<Element[]> => {
    rules.body =
        (rules.bodySelector && document.querySelector(rules.bodySelector)) ||
        document;

    const exclusions: SpacefinderExclusions = {};

    return getReady(rules, options || defaultOptions)
        .then(_ => getCandidates(rules, exclusions))
        .then(candidates => getMeasurements(rules, candidates))
        .then(data => enforceRules(data, rules, exclusions))
        .then(winners => returnCandidates(rules, winners));
};

export const _ = {
    testCandidate, // exposed for unit testing
    testCandidates, // exposed for unit testing
};

export { findSpace, SpaceError };
