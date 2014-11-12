/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/arrays/zip',
    'lodash/collections/reduceRight',
    'lodash/objects/assign',
    'lodash/objects/mapValues',
    'lodash/objects/omit',
    'common/utils/_',
    'common/utils/storage'
], function (
    zip,
    reduceRight,
    assign,
    mapValues,
    omit,
    _,
    storage
) {

    var historyCache,
        summaryCache,
        storageKeyHistory = 'gu.history',
        storageKeySummary = storageKeyHistory + '.summary',
        maxSize = 100;

    function HistoryItem(item, now) {
        assign(this, item);
        this.timestamp = now;
        this.count = 1;
        return this;
    }

    function Summary() {
        this.sections = {};
        this.series = {};
        this.keywords = {};
        this.authors = {};
        this.blogs = {};
    }

    function updateSummaryTypeFromIdName(idNameMap, summary) {
        var id = idNameMap[0][0],
            name = idNameMap[0][1],
            nameCount = summary[id] || [name, 0];

        nameCount[1] = nameCount[1] + 1;
        nameCount[0] = name;
        summary[id] = nameCount;

        return summary;
    }

    function updateSummaryFromAllMeta(metaList, summary) {
        var metaType, idNameMap;

        for (metaType in metaList) {
            idNameMap = metaList[metaType];
            summary[metaType] = updateSummaryTypeFromIdName(idNameMap, summary[metaType]);
        }

        return summary;
    }

    function addItemAndUpdateSummary(itemsSoFar, itemToAdd) {
        itemsSoFar.recentPages.unshift(itemToAdd);
        itemsSoFar.summary = updateSummaryFromAllMeta(itemToAdd.meta, itemsSoFar.summary);

        return itemsSoFar;
    }

    function getUpdatedHistory(newItem, oldItems, now, maxSize) {
        var items = reduceRight(oldItems, function (items, item) {
            if (item.id === newItem.id) {
                items.currentItem.count = items.currentItem.count + item.count;
            } else if (item.meta) { // only add non legacy items with a meta block
                items = addItemAndUpdateSummary(items, item);
            }

            return items;
        }, {
            currentItem: new HistoryItem(newItem, now),
            recentPages: [],
            summary: new Summary()
        });

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

    function pageInHistory(pageId, history) {
        var foundItem = _.find(history, function (historyItem) {
            return (historyItem.id === pageId);
        });
        return foundItem.count > 1;
    }

    function getHead(csString) {
        return csString && ((csString + '').split(',')[0]);
    }

    function preparePage(page) {
        return {
            id: page.pageId,
            meta: omit({
                sections: [[page.section, page.sectionName]],
                series: [[page.seriesId, page.series]],
                keywords: [[getHead(page.keywordIds), getHead(page.keywords)]],
                authors: [[getHead(page.authorIds), getHead(page.author)]],
                blogs: [[getHead(page.blogIds), getHead(page.blogs)]]
            }, function (list) {
                return !list[0][0] || !list[0][1];
            })
        };
    }

    function getSummary() {
        summaryCache = summaryCache || storage.local.get(storageKeySummary) || new Summary();
        return summaryCache;
    }

    function getHistory() {
        historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
        return historyCache;
    }

    function set(history, summary) {
        historyCache = history;
        storage.local.set(storageKeyHistory, history);
        summaryCache = summary;
        storage.local.set(storageKeySummary, summary);
    }

    return {

        test: {
            Summary: Summary,
            updateSummaryTypeFromIdName: updateSummaryTypeFromIdName,
            updateSummaryFromAllMeta: updateSummaryFromAllMeta,
            getUpdatedHistory: getUpdatedHistory,
            preparePage: preparePage,
            set: set,
            pageInHistory: pageInHistory,

            reset: function () {
                historyCache = undefined;
                summaryCache = undefined;
                storage.local.remove(storageKeyHistory);
                storage.local.remove(storageKeySummary);
            }

        },

        getSummary: getSummary,

        getHistory: getHistory,

        getSectionCounts: function (summary) {
            return getCountsMap('sections', summary);
        },

        getLeadKeywordCounts: function (summary) {
            return getCountsMap('keywords', summary);
        },

        pageHasBeenSeen: function (pageId) {
            return pageInHistory(pageId, getHistory());
        },

        log: function (page) {
            var newItem = preparePage(page),
                oldItems = getHistory(),
                items = getUpdatedHistory(newItem, oldItems, Date.now(), maxSize);

            set(items.recentPages, items.summary);

        }

    };
});
