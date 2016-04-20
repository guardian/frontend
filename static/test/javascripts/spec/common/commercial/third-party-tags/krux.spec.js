define([
    'common/utils/$',
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
            injector.require(['common/modules/commercial/third-party-tags/krux', 'common/utils/config'], function () {
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

            expect(krux.load()).toBeFalsy();
        });

        it('should send correct "netid" param', function () {
            krux.load();
            var url = requireStub.args[0][0][0];

            expect(url).toBe('js!//cdn.krxd.net/controltag?confid=JVZiE3vn');
        });

    });
});
