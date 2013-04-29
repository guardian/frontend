define(['modules/local-storage'], function(localStorage) {

    describe('localStorage module', function() {

        afterEach(function() {
            // restore stubbed local storage methods
            for (var prop in window.localStorage) {
                if (window.localStorage[prop].restore) {
                    window.localStorage[prop].restore();
                }
            }
        });
        
        function testSetAndGet(key, data, dataAsString, type) {
            sinon.stub(window.localStorage, 'setItem').withArgs(key, dataAsString + '|' + type).returns(true);
            expect(localStorage.set(key, data)).toBeTruthy();
            sinon.stub(window.localStorage, 'getItem').withArgs(key).returns(dataAsString + '|' + type);
            expect(localStorage.get(key)).toEqual(data);
        }

        it('shouldn\'t be available if can\'t set data', function() {
            sinon.stub(window.localStorage, 'setItem').throws();
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
            sinon.stub(window.localStorage, 'removeItem').withArgs(key).returns(true);
            expect(localStorage.remove(key)).toBeTruthy();
        });

        it('should be able to clear data', function() {
            sinon.stub(window.localStorage, 'clear').returns(true);
            expect(localStorage.clear()).toBeTruthy();
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
