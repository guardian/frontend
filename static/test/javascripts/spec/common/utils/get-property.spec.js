define(['common/utils/get-property'], function (getProperty) {
    describe('Get Property', function () {

        var object = {
            prop1: 'foo',
            prop2: {
                bar: 'baz'
            }
        };

        it('should return true if property exists', function () {
            expect(getProperty(object, 'prop1')).toBe('foo');
        });

        it('should return false if property doesn`t', function () {
            expect(getProperty(object, 'propBad')).toBe(false);
        });

        it('should return a default value if property doesn`t', function () {
            expect(getProperty(object, 'propBad', '')).toBe('');
        });

        it('should return true if property is nested', function () {
            expect(getProperty(object, 'prop2.bar')).toBe('baz');
        });

        it('should return default value if nested property doesn`t exist', function () {
            expect(getProperty(object, 'prop2.bad', '')).toBe('');
        });

        it('should return false if nested properties don`t exist', function () {
            expect(getProperty(object, 'propBad.bad')).toBe(false);
        });

        it('should return false if object doesn`t exist', function () {
            expect(getProperty(null, 'propBad.bad')).toBe(false);
        });

    });
});
