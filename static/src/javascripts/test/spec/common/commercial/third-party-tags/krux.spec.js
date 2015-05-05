import $ from 'common/utils/$'
import Injector from 'helpers/injector'

new Injector()
    .test(['common/modules/commercial/third-party-tags/krux', 'common/utils/config'], function (krux, config) {

        describe('Krux', function () {

            beforeEach(function () {
                config.switches = {
                    krux: true
                };
                requireStub = sinon.stub(window, 'require');
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
