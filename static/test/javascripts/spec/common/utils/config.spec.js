define([
    'common/utils/config'
], function (
    config
) {
    describe('Config', function () {

        beforeEach(function () {
            config.page = {
                tones: 'foo',
                series: 'bar',
                references: [{baz: 'one'}, {baz: 'two'}],
                webPublicationDate: '2013-03-20T17:07:00.000Z'
            };
        });

        it('should have "hasTone" property', function () {
            expect(config.hasTone('foo')).toBeTruthy();
            expect(config.hasTone('foo-bad')).toBeFalsy();
        });

        it('should have "hasSeries" property', function () {
            expect(config.hasSeries('bar')).toBeTruthy();
            expect(config.hasSeries('bar-bad')).toBeFalsy();
        });

        it('should have "referencesOfType" property', function () {
            expect(config.referencesOfType('baz')).toEqual(['one', 'two']);
            expect(config.referencesOfType('bar-bad')).toEqual([]);
        });

        it('should have "referenceOfType" property', function () {
            expect(config.referenceOfType('baz')).toEqual('one');
            expect(config.referenceOfType('bar-bad')).toBeUndefined();
        });

        it('should have "webPublicationDateAsUrlPart" property', function () {
            expect(config.webPublicationDateAsUrlPart()).toBe('2013/03/20');
        });
    });
});
