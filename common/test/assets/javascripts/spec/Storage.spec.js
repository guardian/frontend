define(['common', 'modules/storage'], function(common, storage) {

    describe('Storage', function() {

        var date;

        Date.prototype.addHours = function(h){
            this.setHours(this.getHours()+h);
            return this;
        };

        beforeEach(function() {
            sinon.spy(common.mediator, 'emit');
           date = new Date;
        });

        afterEach(function() {
            // restore stubbed local storage methods
            for (var prop in window.localStorage) {
                if (window.localStorage[prop].restore) {
                    window.localStorage[prop].restore();
                }
            }
            storage._setWindow(window);
            common.mediator.emit.restore();
        });
        
        function setWindowLocalStorage(winLocalStorage) {
            storage._setWindow({localStorage: winLocalStorage})
        }
        
        function testSetAndGet(key, data, dataAsString) {
            setWindowLocalStorage({
                setItem: sinon.stub().withArgs(key, dataAsString).returns(true),
                getItem: sinon.stub().withArgs(key).returns(dataAsString),
                removeItem: sinon.stub().withArgs(dataAsString)
            });
            expect(storage.set(key, data)).toBeTruthy();
            expect(storage.get(key)).toEqual(data);
        }

        it('shouldn\'t be available if can\'t set data', function() {
            setWindowLocalStorage({
                setItem: sinon.stub().throws()
            });
            expect(storage.isAvailable()).toBeFalsy();
            expect(common.mediator.emit).toHaveBeenCalledWith('module:error', 'Unable to save to local storage: Error', 'modules/storage.js');
        });

        it('should save and retrieve data', function() {
            testSetAndGet('foo', 'bar', '{"value": "bar"}');
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

        it('should handle migrating non-stringified data', function() {
            setWindowLocalStorage({
                getItem: sinon.stub().withArgs('foo').returns('bar|string'),
                removeItem: sinon.stub().withArgs('foo')
            });
            expect(storage.get('foo')).toBeNull();
        });
        
        describe('Expiration', function() {

            it('should delete if expired', function() {
                var expires = date.addHours(-1),
                    key = 'foo',
                    value = 'bar',
                    storedData = '{"value":"' + value + '","expires":"' + expires.toISOString() + '"}',
                    setItemSpy = sinon.spy(),
                    removeItemSpy = sinon.spy();
                setWindowLocalStorage({
                    setItem: setItemSpy,
                    getItem: sinon.stub().returns(storedData),
                    removeItem: removeItemSpy
                });

                storage.set(key, value, {expires: expires});

                // expectations
                expect(storage.get(key)).toBeNull();
                expect(setItemSpy).toHaveBeenCalledWith(key, storedData);
                expect(removeItemSpy).toHaveBeenCalledWith(key);
            });

            it('should not delete if not expired', function() {
                var expires = date.addHours(+1),
                    key = 'foo',
                    value = 'bar',
                    removeItemSpy = sinon.spy();
                setWindowLocalStorage({
                    getItem: sinon.stub().returns('{"value":"' + value + '","expires":"' + expires.toISOString() + '"}'),
                    removeItem: removeItemSpy
                });

                storage.set(key, value, {expires: expires});

                // expectations
                expect(storage.get(key)).toBe(value);
                expect(removeItemSpy).not.toHaveBeenCalledWith(key);
            });

        })

        describe('Saving and retriving different data types', function() {

            it('Object data', function() {
                testSetAndGet('foo', { bar: 'baz' }, '{"value": {"bar":"baz"}}');
            });

            it('Array data', function() {
                testSetAndGet('foo', ['bar', 'baz'], '{"value": ["bar","baz"]}');
            });

            it('Boolean data', function() {
                testSetAndGet('foo', false, '{"value": false}');
            });

            it('Number data', function() {
                testSetAndGet('foo', 1234, '{"value": 1234}');
            });

            it('String data', function() {
                testSetAndGet('foo', 'bar', '{"value": "bar"}');
            });
            
        });
       
    });
});
