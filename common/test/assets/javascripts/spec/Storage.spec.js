define(['common', 'modules/storage'], function(common, storage) {

    describe('storage module', function() {
        
        sinon.spy(common.mediator, 'emit');

        afterEach(function() {
            // restore stubbed local storage methods
            for (var prop in window.localStorage) {
                if (window.localStorage[prop].restore) {
                    window.localStorage[prop].restore();
                }
            }
            storage._setWindow(window);
        });
        
        function setWindowLocalStorage(winLocalStorage) {
            storage._setWindow({localStorage: winLocalStorage})
        }
        
        function testSetAndGet(key, data, dataAsString, type) {
            setWindowLocalStorage({
                setItem: sinon.stub().withArgs(key, dataAsString + '|' + type).returns(true),
                getItem: sinon.stub().withArgs(key).returns(dataAsString + '|' + type),
                removeItem: sinon.stub().withArgs(dataAsString + '|' + type)
            });
            expect(storage.set(key, data)).toBeTruthy();
            expect(storage.get(key)).toEqual(data);
        }

        it('shouldn\'t be available if can\'t set data', function() {
            setWindowLocalStorage({
                setItem: sinon.stub().throws()
            });
            expect(storage.isAvailable()).toBeFalsy();
            expect(common.mediator.emit).toHaveBeenCalledWith('module:error', 'Unable to save to local storage', 'modules/storage.js');
        });

        it('should save and retrieve data', function() {
            testSetAndGet('foo', 'bar', 'bar', 'string');
        });

        it('should not save if local storage unavailavble', function() {
            sinon.stub(storage, 'isAvailable').returns(false);
            expect(storage.set('foo', 'bar')).toBeFalsy();
            storage.isAvailable.restore();
        });

        it('should be able to remove item', function() {
            var key = 'foo';
            setWindowLocalStorage({
                removeItem: sinon.stub().withArgs(key).returns(true)
            });
            expect(storage.remove(key)).toBeTruthy();
        });

        it('should be able to clear data', function() {
            setWindowLocalStorage({
                clear: sinon.stub().returns(true)
            });
            expect(storage.removeAll()).toBeTruthy();
        });

        it('should return if key not set', function() {
            setWindowLocalStorage({
                getItem: sinon.stub().returns(null)
            });
            expect(storage.get('foo')).toBe(null);
        });

        it('should return number of items in storage', function() {
            storage.removeAll();
            storage.set('foo',' bar');
            expect(storage.length()).toBe(1);
            storage.set('foo2',' bar2');
            expect(storage.length()).toBe(2);
        });

        it('should return item by index', function() {
            storage.removeAll();
            storage.set('foo',' bar');
            expect(storage.getKey(0)).toBe('foo');
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
