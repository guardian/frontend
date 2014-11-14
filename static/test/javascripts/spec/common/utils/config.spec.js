define([
    'jasq'
], function () {

    describe('Config', {
        moduleName: 'common/utils/config',
        specify: function () {

            beforeEach(function () {
                window.guardian.config.page = {
                    tones: 'foo',
                    series: 'bar',
                    references: [{baz: 'one'}, {baz: 'two'}],
                    webPublicationDate: '2013-03-20T17:07:00.000Z'
                };
            });

            afterEach(function () {
                window.guardian.config.page = {};
            });

            it('should have "hasTone" property', function (config) {
                expect(config.hasTone('foo')).toBeTruthy();
                expect(config.hasTone('foo-bad')).toBeFalsy();
            });

            it('should have "hasSeries" property', function (config) {
                expect(config.hasSeries('bar')).toBeTruthy();
                expect(config.hasSeries('bar-bad')).toBeFalsy();
            });

            it('should have "referencesOfType" property', function (config) {
                expect(config.referencesOfType('baz')).toEqual(['one', 'two']);
                expect(config.referencesOfType('bar-bad')).toEqual([]);
            });

            it('should have "referenceOfType" property', function (config) {
                expect(config.referenceOfType('baz')).toEqual('one');
                expect(config.referenceOfType('bar-bad')).toBeUndefined();
            });

            it('should have "webPublicationDateAsUrlPart" property', function (config) {
                expect(config.webPublicationDateAsUrlPart()).toBe('2013/03/20');
            });

        }
    });

});
