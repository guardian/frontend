define([
    'common/modules/onward/history',
    'fixtures/history/contains',
    'fixtures/history/max',
], function(hist, contains, max) {

    var setStorageItem = function(item) {
        window.localStorage.setItem('gu.history', JSON.stringify({
            'value' : item
        }));
    };

    var item = {
            id:"/p/3jbcb",
            meta: {
                section: "foobar",
                keywords: ['foo', 'bar']
            }
        },
        hist;

    describe('History', function() {

        beforeEach(function() {
            hist.reset();
            setStorageItem(contains);
        });

        it('should get history from local storage', function() {
            expect(hist.get()).toEqual(contains);
        });

        it('should set history to local storage', function() {
            hist.log(item);

            expect(hist.get()[0].id).toEqual(item.id);
        });

        it('should set current timestamp for new log entries', function() {
            hist.log(item);

            expect(hist.get()[0].timestamp).toBeDefined();
            expect(hist.get()[0].timestamp).toEqual(jasmine.any(Number));
        });

        it('should extend any optional meta data directly onto the logged items object', function() {
            hist.log(item);

            expect(hist.get()[0].section).toBeDefined();
            expect(hist.get()[0].section).toEqual("foobar");
        });

        it('should be able to check if an item id exists', function() {
            hist.log(item);

            expect(hist.contains(item.id)).toBeTruthy();
        });

        it('should only store 100 latest entries', function() {
            setStorageItem(max);
            hist.log(item);

            expect(hist.getSize()).toEqual(100);
        });

        it('should set the section count in the summary, once per article', function() {
            hist.log(item);
            hist.log(item);

            expect(hist.getSummary().sections.foobar).toEqual(1);
        });

        it('should set the first keyword\'s count in the summary, once per article', function() {
            hist.log(item);
            hist.log(item);

            expect(hist.getSummary().keywords.foo).toEqual(1);
            expect(hist.getSummary().keywords.bar).toEqual(undefined);
        });
    });
});
