define([
    'common/utils/$',
    'helpers/injector'
], function (
    $,
    Injector
) {

    return new Injector()
        .store('common/utils/config')
        .require(['common/modules/commercial/tags/krux', 'mocks'], function (krux, mocks) {

            describe('Krux', function () {

                beforeEach(function () {
                    mocks.store['common/utils/config'].switches = {
                        krux: true
                    };
                    requireStub = sinon.stub(window, 'require');
                });

                afterEach(function () {
                    requireStub.restore();
                });


                it('should not load if switch is off', function () {
                    mocks.store['common/utils/config'].switches.krux = false;

                    expect(krux.load()).toBeFalsy();
                });

                it('should send correct "netid" param', function () {
                    krux.load();
                    var url = requireStub.args[0][0][0];

                    expect(url).toBe('js!//cdn.krxd.net/controltag?confid=JVZiE3vn');
                });

            });

        });

});
