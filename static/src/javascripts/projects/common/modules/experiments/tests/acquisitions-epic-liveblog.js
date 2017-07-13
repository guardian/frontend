// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { logView } from 'common/modules/commercial/acquisitions-view-log';
import template from 'lodash/utilities/template';
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import ElementInView from 'lib/element-inview';
import fastdom from 'lib/fastdom-promise';
import liveblogEpicTemplate from 'raw-loader!common/views/acquisitions-epic-liveblog.html';
import { liveblog as liveblogCopy } from 'common/modules/commercial/acquisitions-copy';

const pageId: string = config.get('page.pageId', '');

let isAutoUpdateHandlerBound = false;

const INSERT_EPIC_AFTER_CLASS = 'js-insert-epic-after';

type TimeData = {
    datetime: string,
    title: string,
    date: string,
    time: string,
};

const getLiveblogEntryTimeData = (el: Element): Promise<TimeData> =>
    fastdom.read(() => {
        const timeEl = el.querySelector('time');
        const absoluteTimeEl = el.querySelector('.block-time__absolute');

        if (timeEl && absoluteTimeEl) {
            return {
                datetime: timeEl.getAttribute('datetime'),
                title: timeEl.getAttribute('title'),
                date: timeEl.innerHTML,
                time: absoluteTimeEl.innerHTML,
            };
        }
    });

const getBlocksToInsertEpicAfter = (): Promise<Array<Element>> =>
    fastdom.read(() => {
        const blocks = document.getElementsByClassName('block');
        const blocksToInsertManualEpicAfter = document.getElementsByClassName(
            INSERT_EPIC_AFTER_CLASS
        );
        const epicsAlreadyOnPage = document.getElementsByClassName('is-epic');

        if (
            blocksToInsertManualEpicAfter.length ||
            epicsAlreadyOnPage.length ||
            blocks.length < 4
        ) {
            return [...blocksToInsertManualEpicAfter];
        }

        const autoBlockNum = Math.floor(Math.random() * 3) + 1;
        const blockToInsertAutoEpicAfter = blocks[autoBlockNum];

        return [...blocksToInsertManualEpicAfter].concat(
            blockToInsertAutoEpicAfter
        );
    });

const setEpicLiveblogEntryTimeData = (
    el: Element,
    timeData: TimeData
): void => {
    const epicTimeEl = el.querySelector('time');
    const epicAbsoluteTimeEl = el.querySelector('.block-time__absolute');

    if (epicTimeEl && epicAbsoluteTimeEl) {
        epicTimeEl.setAttribute('datetime', timeData.datetime);
        epicTimeEl.setAttribute('title', timeData.title);
        epicTimeEl.innerHTML = timeData.date;
        epicAbsoluteTimeEl.innerHTML = timeData.time;
    }
};

const setupViewTracking = (el: Element, test: ContributionsABTest): void => {
    // top offset of 18 ensures view only counts when half of element is on screen
    const elementInView = ElementInView(el, window, {
        top: 18,
    });

    elementInView.on('firstview', () => {
        logView(test.id);
        mediator.emit(test.viewEvent);
    });
};

const addEpicToBlocks = (
    epicHtml: string,
    test: ContributionsABTest
): Promise<void> =>
    getBlocksToInsertEpicAfter().then(blocksToInsertEpicAfter => {
        blocksToInsertEpicAfter.forEach(el => {
            getLiveblogEntryTimeData(el).then((timeData: TimeData) => {
                fastdom.write(() => {
                    const $epic = $.create(epicHtml);
                    $epic.insertAfter(el);
                    $(el).removeClass(INSERT_EPIC_AFTER_CLASS);
                    setEpicLiveblogEntryTimeData($epic[0], timeData);
                    setupViewTracking(el, test);
                });
            });
        });
    });

export const acquisitionsEpicLiveblog: ContributionsABTest = makeABTest({
    id: 'AcquisitionsEpicLiveblog',
    campaignId: 'epic_liveblog',
    campaignSuffix: pageId.replace(/-/g, '_').replace(/\//g, '__'),

    start: '2017-04-01',
    expiry: '2018-04-01',

    author: 'Joseph Smith',
    description:
        'This places the epic underneath liveblog blocks which the author has specified in Composer should have an epic against them',
    successMeasure: 'Member acquisition and contributions',
    idealOutcome:
        'Our wonderful readers will support The Guardian in this time of need!',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    pageCheck(page) {
        return page.contentType === 'LiveBlog';
    },

    variants: [
        {
            id: 'control',
            isUnlimited: true,

            template(variant) {
                return template(liveblogEpicTemplate, {
                    copy: liveblogCopy(
                        variant.options.membershipURL,
                        variant.options.contributeURL
                    ),
                    componentName: variant.options.componentName,
                });
            },

            test(renderFn, variant, test) {
                const epicHtml = variant.options.template(variant);
                addEpicToBlocks(epicHtml, test);

                if (!isAutoUpdateHandlerBound) {
                    mediator.on('modules:autoupdate:updates', () => {
                        addEpicToBlocks(epicHtml, test);
                    });
                    isAutoUpdateHandlerBound = true;
                }
            },
        },
    ],
});
