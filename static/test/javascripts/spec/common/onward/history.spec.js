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
    var newItem1 = {id: 'a', meta: { sections: [['s','sn']], keywords: [['k', 'kn']]} };
    // different article, and note that the display names are different from the previous IDs
    var newItem2 = {id: 'a2', meta: { sections: [['s','sn2']], keywords: [['k', 'kn2']]} };

    describe('updateSummaryTypeFromIdName', function() {

        beforeEach(addObjectMatcher);

        it("should add a first section to the summary", function () {
            var summary = {};

            var expectedSummary = {id: ['name', 1]};

            var newSummary = hist.test.updateSummaryTypeFromIdName([['id', 'name']], summary);

            expect(newSummary).toSameProps(expectedSummary);
        });

        it("should increment in the summary and update the name", function () {
            var summary = {};

            var expectedSummary = {id: ['name2', 2]};

            var intermediate = hist.test.updateSummaryTypeFromIdName([['id','name']], summary);
            var newSummary = hist.test.updateSummaryTypeFromIdName([['id','name2']], intermediate);

            expect(newSummary).toSameProps(expectedSummary);
        });

    });

    describe('updateSummaryFromAllMeta', function() {

        beforeEach(addObjectMatcher);

        it("should add the things when they are set normally", function () {
            var summary = new hist.test.Summary();

            var expectedSummary = {sections: {id: ['name', 1]}, keywords: {kid: ['kname', 1]}};

            var newSummary = hist.test.updateSummaryFromAllMeta({sections: [['id','name']], keywords: [['kid', 'kname']]}, summary);

            expect(newSummary).toSameProps(assign(new hist.test.Summary(), expectedSummary));

        });

        it("should not add when they're not set", function () {
            var summary = new hist.test.Summary();

            var expectedSummary = {};

            var newSummary = hist.test.updateSummaryFromAllMeta({}, summary);

            expect(newSummary).toSameProps(assign(new hist.test.Summary(), expectedSummary));

        });

        it("should increment when a tag is reused, and update the name", function () {
            var summary = new hist.test.Summary();

            var expectedSummary = {sections: {id: ['name2', 2]}, keywords: {kid: ['kname', 1], anotherkid: ['anotherkname', 1]}};

            var intermediate = hist.test.updateSummaryFromAllMeta({sections: [['id','name2']], keywords: [['kid', 'kname']]}, summary);
            var newSummary = hist.test.updateSummaryFromAllMeta({sections: [['id','name2']], keywords: [['anotherkid', 'anotherkname']]}, intermediate);

            expect(newSummary).toSameProps(assign(new hist.test.Summary(), expectedSummary));

        });

    });

    describe('getUpdatedHistory', function() {

        beforeEach(addObjectMatcher);

        it('should store the first article correctly', function() {
            var oldItems = [];

            var expectedSummary = {sections: {s: ['sn', 1]}, keywords: {k: ['kn', 1]}, count: 1};
            var expectedRecent0 = {id: 'a', count: 1, timestamp: 123, meta: { sections: [['s','sn']], keywords: [['k', 'kn']]}};

            var result = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10);

            expect(result.summary).toSameProps(assign(new hist.test.Summary(), expectedSummary));
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });

        it('should not store the first article twice but should update the timestamp', function() {
            var oldItems = [];

            var expectedSummary = {sections: {s: ['sn', 1]}, keywords: {k: ['kn', 1]}, count: 1};
            var expectedRecent0 = {id: 'a', count: 2, timestamp: 124, meta: { sections: [['s','sn']], keywords: [['k', 'kn']]}};

            var afterFirst = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(newItem1, afterFirst, 124, 10);

            expect(result.summary).toSameProps(assign(new hist.test.Summary(), expectedSummary));
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });

        it('should store the second article correctly', function() {
            var oldItems = [];

            var expectedSummary = {sections: {s: ['sn2', 2]}, keywords: {k: ['kn2', 2]}, count: 2};
            var expectedRecent0 = {id: 'a2', count: 1, timestamp: 124, meta: { sections: [['s','sn2']], keywords: [['k', 'kn2']]}};
            var expectedRecent1 = {id: 'a', count: 1, timestamp: 123, meta: { sections: [['s','sn']], keywords: [['k', 'kn']]}};

            var afterFirst = hist.test.getUpdatedHistory(newItem1, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(newItem2, afterFirst, 124, 10);

            expect(result.summary).toSameProps(assign(new hist.test.Summary(), expectedSummary));
            expect(result.recentPages.length).toBe(2);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
            expect(result.recentPages[1]).toSameProps(expectedRecent1);
        });

        it('should lose the oldest article when the limit is exceeded', function() {
            var oldItems = [];

            var expectedSummary = {sections: {s: ['sn', 1]}, keywords: {k: ['kn', 1]}, count: 1};
            var expectedRecent0 = {id: 'a', count: 1, timestamp: 124, meta: { sections: [['s','sn']], keywords: [['k', 'kn']]}};

            var afterFirst = hist.test.getUpdatedHistory(newItem2, oldItems, 123, 1).recentPages;
            var preResult = hist.test.getUpdatedHistory(newItem1, afterFirst, 124, 1);
            // because the trim happens afterwards, the summary will actually have an extra one, so relogging it to forget about that
            var result = hist.test.getUpdatedHistory(newItem1, preResult, 124, 1);

            expect(result.summary).toSameProps(assign(new hist.test.Summary(), expectedSummary));
            expect(result.recentPages.length).toBe(1);
            expect(result.recentPages[0]).toSameProps(expectedRecent0);
        });


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

    describe('history processing functions', function() {

        beforeEach(addObjectMatcher);

        it('getSectionCounts should set the section count in the summary, once per article', function () {
            var oldItems = [];

            var afterFirst = hist.test.getUpdatedHistory(item, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(item, afterFirst, 124, 10);

            expect(hist.getSectionCounts(result.summary).foobar).toEqual(1);
        });

        it('getLeadKeywordCounts should set the first keyword\'s count in the summary, once per article', function () {
            var oldItems = [];

            var afterFirst = hist.test.getUpdatedHistory(item, oldItems, 123, 10).recentPages;
            var result = hist.test.getUpdatedHistory(item, afterFirst, 124, 10);

            expect(hist.getLeadKeywordCounts(result.summary).foo).toEqual(1);
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

            expect(hist.getSummary()).toSameProps(new hist.test.Summary());
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
                meta: {
                    // no series (so series is missing completely)
                    // no blogs (so blogs is empty)
                    // has a section, keywords, authors
                    sections: [['commentisfree', 'Comment is free']],
                    keywords: [['politics/ukip', 'UK Independence party (Ukip)']],
                    authors: [['profile/johnharris', 'John Harris']]
                }
            });
        });

    });

});
