define([
    'common/modules/onward/history',
    'fixtures/history/contains',
    'fixtures/history/max',
], function(History, contains, max) {

    var setStorageItem = function(item) {
        window.localStorage.setItem('gu.history', JSON.stringify({
            'value' : item
        }));
        window.localStorage.removeItem('gu.history.summary');
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
            window.localStorage.removeItem('gu.history');
            setStorageItem(contains);
            hist = new History();
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

        it('should set the history summary to local storage', function() {
            hist.log(item);
            hist.log(item);
            hist.log(item);

            expect(hist.getSummary().sections.foobar).toEqual(3);
            expect(hist.getSummary().keywords.foo).toEqual(3);
            expect(hist.getSummary().keywords.bar).toEqual(3);
        });

    });
});
