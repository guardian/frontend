/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/arrays/zip',
    'lodash/collections/contains',
    'lodash/collections/filter',
    'lodash/collections/reduceRight',
    'lodash/objects/assign',
    'lodash/objects/mapValues',
    'lodash/objects/omit',
    'common/utils/_',
    'common/utils/storage'
], function (
    zip,
    contains,
    filter,
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

    /**
     * {
            "id": "lifeandstyle/food-and-drink",
            "displayName": "Food & drink2",
            "type": "keyword",
            "weight": 50,
            "parentDisplayName": "Life and style2"
        }
     {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50, "Life and style"]
            }
     * @param tag
     * @param summary
     * @param multiplier
     * @returns {*}
     */
    function updateSummaryTypeFromIdName(tag, summary, multiplier) {
        var tagType,
            nameCount,
            oldWeight;

        tagType = (tag.type == 'faciaPage' && summary[tag.id]) ? summary[tag.id][1] : tag.type;
        oldWeight = summary[tag.id] ? summary[tag.id][2] : 0;
        nameCount = [tag.displayName, tagType, oldWeight + (tag.weight * multiplier)];
        if (tag.parentDisplayName) {
            nameCount.push(tag.parentDisplayName);
        }

        summary[tag.id] = nameCount;

        return summary;
    }

    function updateSummaryFromAllMeta(summaryIncrement, summary, multiplier) {
        var i;

        for (i = 0; i < summaryIncrement.length; i++) {
            summary = updateSummaryTypeFromIdName(summaryIncrement[i], summary, multiplier);
        }

        return summary;
    }

    function addItemAndUpdateSummary(itemsSoFar, itemToAdd) {
        itemsSoFar.recentPages.unshift(itemToAdd);
        itemsSoFar.summary = updateSummaryFromAllMeta(itemToAdd.summary, itemsSoFar.summary, itemToAdd.countRepeatVisits ? itemToAdd.count : 1);

        return itemsSoFar;
    }

    function getUpdatedHistory(newItem, oldItems, now, maxSize) {
        var items = reduceRight(oldItems, function (items, item) {
            if (item.id === newItem.id) {
                items.currentItem.count = items.currentItem.count + item.count;
            } else if (item.summary) { // only add non legacy items with a summary block
                items = addItemAndUpdateSummary(items, item);
            }

            return items;
        }, {
            currentItem: new HistoryItem(newItem, now),
            recentPages: [],
            summary: {}
        });

        addItemAndUpdateSummary(items, items.currentItem);
        delete items.currentItem;

        items.recentPages = items.recentPages.slice(0, maxSize);
        //items.summary.count = items.recentPages.length;
        return items;
    }

    /**
     * summary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50 * 2, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10 * 2]
            }
     * @param types
     * @param summary
     * @returns {*}
     */
    function getCountsMap(types, summary) {
        // filter by type and add id -> weight to a map
        var id,
            countsMap = {};

        for (id in summary) {
            if (contains(types, summary[id][1])) {
                countsMap[id] = summary[id][2];
            }
        }

        return countsMap;
    }

    function pageInHistory(pageId, history) {
        var foundItem = _.find(history, function (historyItem) {
            return (historyItem.id === pageId);
        });
        return foundItem.count > 1;
    }

    function preparePage(page) {
        return {
            id: page.pageId,
            countRepeatVisits: page.isFront,
            summary: page.summary
        };
    }

    function getSummary() {
        summaryCache = summaryCache || storage.local.get(storageKeySummary) || {};
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
            return getCountsMap(['section', 'keyword'], summary);
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
