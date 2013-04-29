define(['modules/local-storage'], function(localStorage) {

    describe('localStorage module', function() {

        afterEach(function() {
            // restore stubbed local storage methods
            for (var prop in window.localStorage) {
                if (window.localStorage[prop].restore) {
                    window.localStorage[prop].restore();
                }
            }
            localStorage._setWindow(window);
        });
        
        function setWindowLocalStorage(winLocalStorage) {
            localStorage._setWindow({localStorage: winLocalStorage})
        }
        
        function testSetAndGet(key, data, dataAsString, type) {
            setWindowLocalStorage({
                setItem: sinon.stub().withArgs(key, dataAsString + '|' + type).returns(true),
                getItem: sinon.stub().withArgs(key).returns(dataAsString + '|' + type)
            });
            expect(localStorage.set(key, data)).toBeTruthy();
            expect(localStorage.get(key)).toEqual(data);
        }

        it('shouldn\'t be available if can\'t set data', function() {
            setWindowLocalStorage({
                setItem: sinon.stub().throws()
            });
            expect(localStorage.isAvailable()).toBeFalsy();
        });

        it('should save and retrieve data', function() {
            testSetAndGet('foo', 'bar', 'bar', 'string');
        });

        it('should not save if local storage unavailavble', function() {
            sinon.stub(localStorage, 'isAvailable').returns(false);
            expect(localStorage.set('foo', 'bar')).toBeFalsy();
        });

        it('should be able to remove item', function() {
            var key = 'foo';
            setWindowLocalStorage({
                removeItem: sinon.stub().withArgs(key).returns(true)
            });
            expect(localStorage.remove(key)).toBeTruthy();
        });

        it('should be able to clear data', function() {
            setWindowLocalStorage({
                clear: sinon.stub().returns(true)
            });
            expect(localStorage.removeAll()).toBeTruthy();
        });

        it('should return if key not set', function() {
            setWindowLocalStorage({
                getItem: sinon.stub().returns(null)
            });
            expect(localStorage.get('foo')).toBe(null);
        });

        it('should return number of items in storage', function() {
            localStorage.removeAll();
            localStorage.set('foo',' bar');
            expect(localStorage.length()).toBe(1);
            localStorage.set('foo2',' bar2');
            expect(localStorage.length()).toBe(2);
        });

        it('should return item by index', function() {
            localStorage.removeAll();
            localStorage.set('foo',' bar');
            expect(localStorage.getKey(0)).toBe('foo');
        });
        
        describe('Saving and retriving different data types', function() {

            it('Object data', function() {
                testSetAndGet('foo', { bar: 'baz' }, '{"bar":"baz"}', 'object');
            });

            it('Array data', function() {
                testSetAndGet('foo', ['bar', 'baz'], '["bar","baz"]', 'object');
            });

            it('Boolean data', function() {
                testSetAndGet('foo', false, 'false', 'boolean');
            });

            it('Number data', function() {
                testSetAndGet('foo', 1234, '1234', 'number');
            });
            
        });
       
    });
});
