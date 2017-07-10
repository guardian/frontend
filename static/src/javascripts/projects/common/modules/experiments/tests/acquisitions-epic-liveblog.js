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

const pageId = config.page.pageId || '';

let isAutoUpdateHandlerBound = false;

const INSERT_EPIC_AFTER_CLASS = 'js-insert-epic-after';

const getLiveblogEntryTimeData = el => {
    const $timeEl = $('time', el);

    return {
        datetime: $timeEl.attr('datetime'),
        title: $timeEl.attr('title'),
        date: $timeEl.text(),
        time: $('.block-time__absolute', el).text(),
    };
};

const setEpicLiveblogEntryTimeData = (el, timeData) => {
    if (!el) {
        return;
    }

    const $epicTimeEl = $('time', el);
    $epicTimeEl.attr('datetime', timeData.datetime);
    $epicTimeEl.attr('title', timeData.title);
    $epicTimeEl.text(timeData.date);
    $('.block-time__absolute', el).text(timeData.time);
};

const setupViewTracking = (el, test) => {
    // top offset of 18 ensures view only counts when half of element is on screen
    const elementInView = ElementInView(el, window, {
        top: 18,
    });

    elementInView.on('firstview', () => {
        logView(test.id);
        mediator.emit(test.viewEvent);
    });
};

const addEpicToBlocks = (epicHtml, test) =>
    fastdom.write(() => {
        const $blocksToInsertEpicAfter = $(`.${INSERT_EPIC_AFTER_CLASS}`);

        $blocksToInsertEpicAfter.each(el => {
            const $epic = $.create(epicHtml);

            $epic.insertAfter(el);
            $(el).removeClass(INSERT_EPIC_AFTER_CLASS);

            setEpicLiveblogEntryTimeData(
                $epic[0],
                getLiveblogEntryTimeData(el)
            );

            setupViewTracking(el, test);
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

            insertAtSelector: `.${INSERT_EPIC_AFTER_CLASS}`,
            insertAfter: true,
            insertMultiple: true,
            successOnView: true,

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
