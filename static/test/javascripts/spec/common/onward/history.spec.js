define([
    'common/modules/onward/history',
    'fixtures/history/contains',
    'fixtures/history/max',
], function(hist, contains, max) {

    var setStorageItem = function(data) {
        window.localStorage.setItem('gu.history', JSON.stringify({
            'value' : data
        }));
    };

    var pageConfig = {
            pageId: "/p/3jbcb",

            section: "foobar",
            sectionName: "Foobar Section",

            keywordIds: "foo/bar,baz/poo",
            keywords: "Foobar Tag,Bazpoo Tag",

            seriesId: "foo/series/bar",
            series: "Foobar Series",

            authorIds: "profile/finbarrsaunders,profile/rogermellie",
            author: "Finbarr Saunders, Roger Mellie"
        };

    describe('History', function() {

        beforeEach(function() {
            hist.reset();
            setStorageItem(contains);
        });

        it('should get history from local storage', function() {
            expect(hist.get()).toEqual(contains);
        });

        it('should set history to local storage', function() {
            hist.log(pageConfig);

            expect(hist.get()[0][0]).toEqual(pageConfig.pageId);
        });

        it('should set the count of entries', function() {
            hist.log(pageConfig);
            expect(hist.get()[0][1]).toEqual(1);

            hist.log(pageConfig);
            expect(hist.get()[0][1]).toEqual(2);
        });

        it('should be able to check if an pageConfig id exists', function() {
            hist.log(pageConfig);

            expect(hist.contains(pageConfig.pageId)).toBeTruthy();
        });

        it('should only store 50 latest entries', function() {
            setStorageItem(max);
            hist.log(pageConfig);

            expect(hist.getSize()).toEqual(50);
        });

        it('should increment a count in the summary, for the 1st value from each of various page metadata', function() {
            hist.log(pageConfig);

            expect(hist.getSummary().tags['foobar'][0]).toEqual('Foobar Section');
            expect(hist.getSummary().tags['foobar'][1][0][1]).toEqual(1);
            expect(hist.getSummary().tags['baz/poo']).toBeUndefined();

            expect(hist.getSummary().tags['foo/bar'][0]).toEqual('Foobar Tag');
            expect(hist.getSummary().tags['foo/bar'][1][0][1]).toEqual(1);

            expect(hist.getSummary().tags['foo/series/bar'][0]).toEqual('Foobar Series');
            expect(hist.getSummary().tags['foo/series/bar'][1][0][1]).toEqual(1);

            expect(hist.getSummary().tags['profile/finbarrsaunders'][0]).toEqual('Finbarr Saunders');
            expect(hist.getSummary().tags['profile/finbarrsaunders'][1][0][1]).toEqual(1);
            expect(hist.getSummary().tags['profile/rogermellie']).toBeUndefined();

            hist.log(pageConfig);
            hist.log(pageConfig);

            expect(hist.getSummary().tags['foobar'][0]).toEqual('Foobar Section');
            expect(hist.getSummary().tags['foobar'][1][0][1]).toEqual(3);
        });
    });
});
