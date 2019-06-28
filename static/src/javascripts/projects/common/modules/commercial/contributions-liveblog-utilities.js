// @flow
import { logView } from 'common/modules/commercial/acquisitions-view-log';
import $ from 'lib/$';
import mediator from 'lib/mediator';
import { elementInView } from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';

let isAutoUpdateHandlerBound = false;
const INSERT_EPIC_AFTER_CLASS = 'js-insert-epic-after';

type TimeData = {
    blockHref: string,
    datetime: string,
    title: string,
    date: string,
    time: string,
};

const getLiveblogEntryTimeData = (el: Element): ?TimeData => {
    const timeEl = el.querySelector('time');
    const absoluteTimeEl = el.querySelector('.block-time__absolute');

    if (timeEl && absoluteTimeEl) {
        const link = timeEl.parentNode;
        const blockHref = link instanceof HTMLAnchorElement ? link.href : '';

        return {
            datetime: timeEl.getAttribute('datetime') || '',
            title: timeEl.getAttribute('title') || '',
            date: timeEl.innerHTML,
            time: absoluteTimeEl.innerHTML,
            blockHref,
        };
    }
};

const getBlocksToInsertEpicAfter = (): Array<HTMLElement> => {
    const blocks = document.getElementsByClassName('block');
    const blocksToInsertManualEpicAfter = document.getElementsByClassName(
        INSERT_EPIC_AFTER_CLASS
    );
    const epicsAlreadyOnPage = document.getElementsByClassName('is-epic');

    const isLiveblogLongEnoughYet = blocks.length > 4;

    if (
        blocksToInsertManualEpicAfter.length ||
        epicsAlreadyOnPage.length ||
        !isLiveblogLongEnoughYet
    ) {
        return Array.from(blocksToInsertManualEpicAfter);
    }

    const autoBlockNum = Math.floor(Math.random() * 3);
    const blockToInsertAutoEpicAfter = blocks[autoBlockNum];

    return Array.from(blocksToInsertManualEpicAfter).concat(
        blockToInsertAutoEpicAfter
    );
};

const setEpicLiveblogEntryTimeData = (
    el: Element,
    timeData: TimeData
): void => {
    const epicTimeEl = el.querySelector('time');
    const epicAbsoluteTimeEl = el.querySelector('.block-time__absolute');

    if (epicTimeEl && epicAbsoluteTimeEl) {
        const epicTimeLink = epicTimeEl.parentNode;
        if (epicTimeLink instanceof HTMLAnchorElement) {
            epicTimeLink.href = timeData.blockHref;
        }

        epicTimeEl.setAttribute('datetime', timeData.datetime);
        epicTimeEl.setAttribute('title', timeData.title);
        epicTimeEl.innerHTML = timeData.date;
        epicAbsoluteTimeEl.innerHTML = timeData.time;
    }
};

const setupViewTracking = (
    el: HTMLElement,
    variant: EpicVariant,
    parentTest: EpicABTest
): void => {
    // top offset of 18 ensures view only counts when half of element is on screen
    const inView = elementInView(el, window, {
        top: 18,
    });

    inView.on('firstview', () => {
        logView(variant.id);
        mediator.emit(parentTest.viewEvent, {
            componentType: parentTest.componentType,
            campaignCode: variant.campaignCode,
        });
    });
};

const addEpicToBlocks = (
    epicHtml: string,
    variant: EpicVariant,
    parentTest: EpicABTest
): Promise<void> => {
    const elementsWithTimeData = getBlocksToInsertEpicAfter().map(el => [
        el,
        getLiveblogEntryTimeData(el),
    ]);

    return fastdom.write(() => {
        elementsWithTimeData.forEach(([el, timeData]) => {
            if (!timeData) {
                return;
            }

            const $epic = $.create(epicHtml);
            $epic.insertAfter(el);
            mediator.emit(parentTest.insertEvent);
            $(el).removeClass(INSERT_EPIC_AFTER_CLASS);
            setEpicLiveblogEntryTimeData($epic[0], timeData);
            setupViewTracking(el, variant, parentTest);
        });
    });
};

export const setupEpicInLiveblog = (
    epicHtml: string,
    variant: EpicVariant,
    parentTest: EpicABTest
): void => {
    addEpicToBlocks(epicHtml, variant, parentTest);

    if (!isAutoUpdateHandlerBound) {
        mediator.on('modules:autoupdate:updates', () => {
            addEpicToBlocks(epicHtml, variant, parentTest);
        });
        isAutoUpdateHandlerBound = true;
    }
};
