define([
    'lib/$',
    'helpers/injector'
], function (
    $,
    Injector
) {
    describe('Krux', function () {

        var injector = new Injector(),
            requireStub,
            krux, config;

        beforeEach(function (done) {
            injector.require(['commercial/modules/third-party-tags/krux', 'lib/config'], function () {
                krux = arguments[0];
                config = arguments[1];

                config.switches = {
                    krux: true
                };
                requireStub = sinon.stub(window, 'require');

                done();
            });
        });

        afterEach(function () {
            requireStub.restore();
        });

        it('should not load if switch is off', function () {
            config.switches.krux = false;

            expect(krux.shouldRun).toBeFalsy();
        });

        it('should send correct "netid" param', function () {
            expect(krux.url).toBe('//cdn.krxd.net/controltag?confid=JVZiE3vn');
        });

    });
});
