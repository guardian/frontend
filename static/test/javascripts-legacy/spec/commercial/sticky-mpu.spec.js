define([
    'helpers/injector'
], function (
    Injector
) {
    describe('Sticky MPU', function () {

        var injector = new Injector(),
            StickyMpu;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/sticky-mpu'
            ], function($1) {
                StickyMpu = $1;
                done();
            },
            done.fail);
        });

        it('should exist', function () {
            expect(StickyMpu).toBeDefined();
        });

    });
});
