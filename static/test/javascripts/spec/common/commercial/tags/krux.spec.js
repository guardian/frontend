define([
    'common/utils/$',
    'jasq'
], function (
    $
) {
    describe('Krux', {
        moduleName: 'common/modules/commercial/tags/krux',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            krux: true
                        }
                    };
                }
            }
        },
        specify: function () {

            beforeEach(function () {
                requireStub = sinon.stub(window, 'require');
            });

            afterEach(function () {
                requireStub.restore();
            });


            it('should not load if switch is off', function (krux, deps) {
                deps['common/utils/config'].switches.krux = false;

                expect(krux.load()).toBeFalsy();
            });

            it('should send correct "netid" param', function (krux) {
                krux.load();
                var url = requireStub.args[0][0][0];

                expect(url).toBe('js!//cdn.krxd.net/controltag?confid=JVZiE3vn');
            });

        }
    });

});
