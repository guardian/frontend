define(['common/modules/onward/tech-feedback'], function (TechFeedback) {
    describe('Tech-feedback', function () {

        it('should exist', function () {
            expect(TechFeedback).toBeDefined();
        });

        it('should be able to get no params from the empty hash', function () {

            var t = new TechFeedback();
            var values = t.getValuesFromHash('');
            expect(values).toEqual({});
        });

        it('should be able to get one param from the hash', function () {

            var t = new TechFeedback();
            var values = t.getValuesFromHash('#page=cheese');
            expect(values).toEqual({'page': 'cheese'});
        });

        it('should be able to get more than one param from the hash', function () {

            var t = new TechFeedback();
            var values = t.getValuesFromHash('#page=cheese&url=milk');
            expect(values).toEqual({'page': 'cheese', 'url': 'milk'});
        });

        it('should decide uri components', function () {

            var t = new TechFeedback();
            var values = t.getValuesFromHash('#http%3A%2F%2Fwww.theguardian.com=http%3A%2F%2Fwww.theguardian.com');
            expect(values).toEqual({'http://www.theguardian.com': 'http://www.theguardian.com'});
        });

        it('should be able to get ads creative IDs', function () {

            var t = new TechFeedback();
            var values = t.getValuesFromHash('#ads=67729052367%2C71293284447');
            expect(values).toEqual({'ads': '67729052367,71293284447'});
        });

        it('should be able to get Ophan viewId', function () {

            var t = new TechFeedback();
            var values = t.getValuesFromHash('#ophanId=igdn1xckorpgh5z5ucdv');
            expect(values).toEqual({'ophanId': 'igdn1xckorpgh5z5ucdv'});
        });
    });
});
