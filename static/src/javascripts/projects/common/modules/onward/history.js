/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/arrays/zip',
    'lodash/collections/reduceRight',
    'lodash/objects/assign',
    'lodash/objects/mapValues',
    'common/utils/storage'
], function (
    zip,
    reduceRight,
    assign,
    mapValues,
    storage
) {

    var historyCache,
        summaryCache,
        storageKeyHistory = 'gu.history',
        storageKeySummary = storageKeyHistory + '.summary';

    function HistoryItem(item, now) {
        assign(this, item);
        this.timestamp = now;
        this.count = 1;
        return this;
    }

    function Summary() {
        this.section = {};
        this.series = {};
        this.leadKeyword = {};
        this.leadAuthor = {};
        this.leadBlog = {};
    }

    function updateSummaryTypeFromIdName(idName, summary) {

        var nameCount = summary[idName[0]] || [idName[1], 0];
        nameCount[1] = nameCount[1] + 1;
        nameCount[0] = idName[1];
        summary[idName[0]] = nameCount;

        return summary;
    }

    function updateSummaryFromAllMeta(metaList, summary) {

        var metaType, idName;

        for (metaType in metaList) {

            if (!metaList.hasOwnProperty(metaType) || !new Summary().hasOwnProperty(metaType)) {
                continue;
            }

            idName = metaList[metaType];
            summary[metaType] = updateSummaryTypeFromIdName(idName, summary[metaType]);

        }

        return summary
    }

    function addItemAndUpdateSummary(itemsSoFar, itemToAdd) {

        itemsSoFar.recentPages.unshift(itemToAdd);

        itemsSoFar.summary = updateSummaryFromAllMeta(itemToAdd.meta, itemsSoFar.summary);

        return itemsSoFar;
    }

    function getUpdatedHistory(newItem, oldItems, now, maxSize) {
        var initialValue, reduceItems, items;

        initialValue = {
            currentItem: new HistoryItem(newItem, now),
            recentPages: [],
            summary: new Summary()
        };

        reduceItems = function (items, item) {
            if (item.id === newItem.id) {
                items.currentItem.count = items.currentItem.count + item.count;
            } else {
                if (item.meta) { // only add non legacy items with a meta block
                    items = addItemAndUpdateSummary(items, item);
                }
            }

            return items;
        };

        items = reduceRight(oldItems, reduceItems, initialValue);
        addItemAndUpdateSummary(items, items.currentItem);
        delete items.currentItem;

        items.recentPages = items.recentPages.slice(0, maxSize);
        items.summary.count = items.recentPages.length;
        return items;
    }

    function getCountsMap(metaName, summary) {
        return mapValues(summary[metaName], function (nameCount) {
            return nameCount[1];
        });
    }

    return {

        test: {
            Summary: Summary,
            updateSummaryTypeFromIdName: updateSummaryTypeFromIdName,
            updateSummaryFromAllMeta: updateSummaryFromAllMeta,

            reset: function () {
                historyCache = undefined;
                summaryCache = undefined;
                storage.local.remove(storageKeyHistory);
                storage.local.remove(storageKeySummary);
            }

        },

        maxSize: 100,

        impure: {

            getSummary: function () {
                summaryCache = summaryCache || storage.local.get(storageKeySummary) || new Summary();
                return summaryCache;
            },

            getHistory: function () {
                historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
                return historyCache;
            },

            set: function (history, summary) {
                historyCache = history;
                storage.local.set(storageKeyHistory, history);
                summaryCache = summary;
                storage.local.set(storageKeySummary, summary);
            }

        },

        getSectionCounts: function (summary) {
            return getCountsMap('section', summary);
        },

        getLeadKeywordCounts: function (summary) {
            return getCountsMap('leadKeyword', summary);
        },

        getUpdatedHistory: getUpdatedHistory,

        preparePage: function (page) {
            return {
                id: '/' + page.pageId,
                meta: new (function () {

                    var getHead = function (csString) {
                        return csString && ((csString + '').split(',')[0]);
                    };

                    // everything in here is summarised with counts
                    page.section && (this.section = [page.section, page.sectionName]);
                    page.seriesId && (this.series = [page.seriesId, page.series]);
                    page.keywordIds && (this.leadKeyword = [getHead(page.keywordIds), getHead(page.keywords)]);
                    page.authorIds && (this.leadAuthor = [getHead(page.authorIds), getHead(page.author)]);
                    page.blogIds && (this.leadBlog = [getHead(page.blogIds), getHead(page.blogs)]);
                })()
            };

        }

    };
});
