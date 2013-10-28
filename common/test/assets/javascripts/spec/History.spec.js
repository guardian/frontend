define([
    'modules/onward/history',
    'fixtures/history/contains',
    'fixtures/history/max',
], function(history, contains, max) {

    var setStorageItem = function(item) {
        window.localStorage.setItem('gu.history', JSON.stringify({
            'value' : item
        }));
    };

    var clone = function(oldArr) {
        var newArr= [];
        oldArr.forEach(function(el) { newArr.push(el) });
        return newArr;
    };

    var id = 'p/3jp8n';

    describe('History', function() {

        beforeEach(function() {
            window.localStorage.removeItem('gu.history');
        });

        it('should get history from local storage', function() {
            setStorageItem(contains);
            expect(history.get()).toEqual(contains);
        });

        it('should set history to local storage', function() {
            var assert = clone(contains);

            assert.unshift(id);

            setStorageItem(contains);
            history.log(id);

            expect(history.get()).toEqual(assert);
        });

        it('should only store 100 latest entries', function() {
            var assert = clone(max);

            assert.pop();
            assert.unshift(id);

            setStorageItem(max);
            history.log(id);

            expect(history.get()).toEqual(assert);
        });

        it('should not duplicate entries', function() {

            setStorageItem(contains);
            history.log("p/3jqf9");

            expect(history.get()).toEqual(["p/3jqf9", "p/3jqha", "p/3jqg5", "p/3jqgy"]);
        });

    });
});
