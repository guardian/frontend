define([
    'common/modules/onward/history',
    'fixtures/history/config-page',
    'fixtures/history/contains',
    'fixtures/history/max',
    'lodash/collections/reduce',
    'lodash/collections/sortBy',
    'lodash/objects/assign',
    'lodash/objects/isEqual'
], function (hist, configPage, contains, max, reduce, sortBy, assign, isEqual) {

    function addObjectMatcher() {
        jasmine.addMatchers({
            toSameProps: function () {

                return {
                    compare: function (actual, expected) {

                        function isSame(actual, expected) {
                            var sameProps = isEqual(sortBy(Object.keys(actual)), sortBy(Object.keys(expected)));
                            var differingProps;
                            if (sameProps) {
                                differingProps = reduce(Object.keys(actual), function (sofar, propToCheck) {
                                    if (typeof expected[propToCheck] === 'object' && expected[propToCheck] ) {
                                        // if it's an object, recurse
                                        var nestedSame = isSame(actual[propToCheck], expected[propToCheck]);
                                        if (!nestedSame[0]) {
                                            sofar.push('{'+propToCheck + ': [' + nestedSame[1] + ']}');
                                        }
                                    } else if (!isEqual(expected[propToCheck], actual[propToCheck])) {
                                        sofar.push(propToCheck + ' <<expected: ' + expected[propToCheck] + ' actual: ' + actual[propToCheck] + '>>');
                                    }
                                    return sofar;
                                }, []);
                            }
                            return [sameProps && differingProps.length == 0, sameProps ? differingProps : "property names expected: " + Object.keys(expected) + ' actual: ' + Object.keys(actual)];
                        }

                        var sameProps = isSame(actual, expected);
                        return {
                            pass: sameProps[0],
                            message: 'incorrect data values: ' + sameProps[1] + " Expected " + JSON.stringify(actual) + " to be similar to " + JSON.stringify(expected)
                        };

                    }
                }

            }
        });
    }

    // basic item
    var newItem1 = {id: 'a', countRepeatVisits: true, "summary": [
        {
            "id": "lifeandstyle/food-and-drink",
            "displayName": "Food & drink",
            "type": "keyword",
            "weight": 50,
            "parentDisplayName": "Life and style"
        },
        {
            "id": "lifeandstyle",
            "displayName": "Life and style",
            "type": "section",
            "weight": 10
        }
    ] };
    var nonDuplicatableItem1 = assign(assign({}, newItem1), {countRepeatVisits: false});
    // different article, and note that the display names are different from the previous IDs
    var newItem2 = {id: 'a2', countRepeatVisits: true, "summary": [
        {
            "id": "lifeandstyle/food-and-drink",
            "displayName": "Food & drink2",
            "type": "keyword",
            "weight": 50,
            "parentDisplayName": "Life and style2"
        },
        {
            "id": "lifeandstyle",
            "displayName": "Life and style2",
            "type": "section",
            "weight": 10
        }
    ] };

    // faciaPage means we don't know whether it's a tag or section yet
    var faciaPage = {id: 'a3', countRepeatVisits: true, "summary": [
        {
            "id": "lifeandstyle",
            "displayName": "Life and style",
            "type": "faciaPage",
            "weight": 10
        }
    ] };

    describe('updateSummaryTypeFromIdName', function() {

        /*
         * this method should take a summary increment block and the existing summary and either add the whole item afresh
         * or sum the weights if it's already there.
         * If the type is faciaPage it should be overridden
         */

        beforeEach(addObjectMatcher);

        it("should add a first section to the summary with a parent and handle parentDisplayName and multiplier", function () {
            var summary = {};

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 2 * 50, "Life and style"]
            };

            var newSummary = hist.test.updateSummaryTypeFromIdName(newItem1.summary[0], summary, 2);

            expect(newSummary).toSameProps(expectedSummary);
        });

        it("should sum the weights of a section and update the name", function () {
            var summary = {};

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink2", "keyword", 100, "Life and style2"]
            };

            var intermediate = hist.test.updateSummaryTypeFromIdName(newItem1.summary[0], summary, 1);

            var newSummary = hist.test.updateSummaryTypeFromIdName(newItem2.summary[0], intermediate, 1);

            expect(newSummary).toSameProps(expectedSummary);
        });

        it("should supersede faciaPage with section and handle no parentDisplayName", function () {
            var summary = {};

            var expectedSummary = {
                'lifeandstyle': ["Life and style", "section", 20]
            };

            var intermediate = hist.test.updateSummaryTypeFromIdName(faciaPage.summary[0], summary, 1);

            var newSummary = hist.test.updateSummaryTypeFromIdName(newItem1.summary[1], intermediate, 1);

            expect(newSummary).toSameProps(expectedSummary);
        });

        it("should supersede faciaPage with section (reverse order)", function () {
            var summary = {};

            var expectedSummary = {
                'lifeandstyle': ["Life and style", "section", 20]
            };

            var intermediate = hist.test.updateSummaryTypeFromIdName(newItem1.summary[1], summary, 1);

            var newSummary = hist.test.updateSummaryTypeFromIdName(faciaPage.summary[0], intermediate, 1);

            expect(newSummary).toSameProps(expectedSummary);
        });

    });

    describe('updateSummaryFromAllMeta', function() {

        beforeEach(addObjectMatcher);

        it("should add all of the items to the summary", function () {
            var summary = {};

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10]
            };

            var newSummary = hist.test.updateSummaryFromAllMeta(newItem1.summary, summary, 1);

            expect(newSummary).toSameProps(expectedSummary);
        });

    });

    describe('getUpdatedHistory', function() {

        beforeEach(addObjectMatcher);

        it('should store the first article correctly', function() {
            var oldItems = [];

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10]
            };

            var expectedRecent0 = assign({count: 1, timestamp: 123}, newItem1);

            var result = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10);

            expect(result.summary).toSameProps(expectedSummary);
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });

        it('should bring back the lower item to the top when its readded', function() {
            var oldItems = [];

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50 * 3, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10 * 3]
            };

            var expectedRecent0 = assign({count: 2, timestamp: 125}, newItem1);
            var expectedRecent1 = assign({count: 1, timestamp: 124}, newItem2);

            var afterFirst = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10).recentPages;
            var afterSecond = hist.test.getUpdatedHistory(newItem2, afterFirst, 124, 10).recentPages;
            var result = hist.test.getUpdatedHistory(newItem1, afterSecond, 125, 10);

            expect(result.summary).toSameProps(expectedSummary);
            expect(result.recentPages.length).toBe(2);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
            expect(result.recentPages[1]).toSameProps(expectedRecent1);
        });

        it('should not store the first article twice but should update the timestamp and double the weight when enabled', function() {
            var oldItems = [];

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50 * 2, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10 * 2]
            };

            var expectedRecent0 = assign({count: 2, timestamp: 124}, newItem1);

            var afterFirst = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(newItem1, afterFirst, 124, 10);

            expect(result.summary).toSameProps(expectedSummary);
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });

        it('should not store the first article twice but should update the timestamp and dont double the weight when disabled', function() {
            var oldItems = [];

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10]
            };

            var expectedRecent0 = assign({count: 2, timestamp: 124}, nonDuplicatableItem1);

            var afterFirst = hist.test.getUpdatedHistory(nonDuplicatableItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(nonDuplicatableItem1, afterFirst, 124, 10);

            expect(result.summary).toSameProps(expectedSummary);
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });

        it('should lose the oldest article when the limit is exceeded', function() {
            var oldItems = [];

            var expectedSummary = {
                'lifeandstyle/food-and-drink': ["Food & drink", "keyword", 50 * 2, "Life and style"],
                'lifeandstyle': ["Life and style", "section", 10 * 2]
            };

            var expectedRecent0 = assign({count: 2, timestamp: 125}, newItem1);

            var afterFirst = hist.test.getUpdatedHistory(newItem2, oldItems, 123, 1).recentPages;
            var afterSecond = hist.test.getUpdatedHistory(newItem1, afterFirst, 124, 1).recentPages;
                // because the trim happens afterwards, the summary will actually have an extra one, so relogging it to forget about that
            var result = hist.test.getUpdatedHistory(newItem1, afterSecond, 125, 1);

            expect(result.summary).toSameProps(expectedSummary);
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });

        // do we need a test for bring to the beginning?

    });

    var setStorageItem = function (item) {
        window.localStorage.setItem('gu.history', JSON.stringify({
            'value': item
        }));
    };

    var item = {
            id:"p/3jbcb",
            meta: {
                sections: [["foobar", 'name']],
                keywords: [['foo', 'fooName']]
            }
        };

    describe('reading/writing history to localStorage', function () {

        beforeEach(function () {
            hist.test.reset();
            setStorageItem(contains);
        });

        it('should get history from local storage', function () {
            expect(hist.getHistory()).toEqual(contains);
        });

        it('should set history to local storage', function () {
            hist.test.set([item], {keywords: 'testing'});

            expect(hist.getHistory()[0].id).toEqual(item.id);
            expect(hist.getSummary().keywords).toEqual('testing');
        });

    });

    describe('history processing functions', function () {

        beforeEach(addObjectMatcher);

        it('getSectionCounts should set the section count in the summary, once per article', function () {
            var oldItems = [];

            var afterFirst = hist.test.getUpdatedHistory(nonDuplicatableItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(nonDuplicatableItem1, afterFirst, 124, 10);

            expect(hist.getSectionCounts(result.summary).lifeandstyle).toEqual(10);
            expect(hist.getSectionCounts(result.summary)['lifeandstyle/food-and-drink']).toEqual(50);
        });

        it('pageInHistory if its in there twice should be true', function () {
            var oldItems = [];

            var afterFirst = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(newItem1, afterFirst, 124, 10);

            expect(hist.test.pageInHistory(newItem1.id, result.recentPages)).toBe(true);
        });

        it('pageInHistory if its in there once should be false', function () {
            var oldItems = [];

            var afterFirst = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(newItem2, afterFirst, 124, 10);

            expect(hist.test.pageInHistory(newItem1.id, result.recentPages)).toBe(false);
        });

    });

    describe('History defaults', function () {

        beforeEach(function () {
            hist.test.reset();
            addObjectMatcher();
        });

        it('should return a blank summary if one is not set', function () {

            expect(hist.getSummary()).toSameProps({});
        });

        it('should return a blank history if one is not set', function () {

            expect(hist.getHistory()).toSameProps([]);
        });

    });

    describe('preparePage', function () {

        beforeEach(addObjectMatcher);

        it('should handle a real config.page into a newItem object', function () {

            var preparedPage = hist.test.preparePage(configPage);

            expect(preparedPage).toSameProps({
                id: 'commentisfree/2014/oct/08/clacton-byelection-parties-defiance-coast-strood-ukip',
                countRepeatVisits: true,
                summary: configPage.summary
            });
        });

    });

});
