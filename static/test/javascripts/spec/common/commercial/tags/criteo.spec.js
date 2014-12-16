define([
    'squire',
    'lodash/arrays/zipObject',
    'common/utils/$'
], function (
    Squire,
    zipObject,
    $
) {

    new Squire()
        .store('common/utils/config')
        .require(['common/modules/commercial/tags/criteo', 'mocks'], function (criteo, mocks) {

            function retrieveParams(url) {
                return zipObject(url.split('?').pop().split('!').shift().split('&').map(function(param) {
                    return param.split('=');
                }));
            }

            describe('Criteo', function () {

                beforeEach(function () {
                    mocks.store['common/utils/config'].switches = {
                        criteo: true
                    };
                    requireStub = sinon.stub(window, 'require');
                });

                afterEach(function () {
                    $('.criteo-script').remove();
                    requireStub.restore();
                });

                it('should not load if switch is off', function () {
                    mocks.store['common/utils/config'].switches.criteo = false;

                    expect(criteo.load()).toBeFalsy();
                });

                it('should send correct "netid" param', function () {
                    criteo.load();
                    var url = requireStub.args[0][0][0];

                    expect(retrieveParams(url).netid).toBe('1476');
                });

                it('should send correct "cookieName" param', function () {
                    criteo.load();
                    var url = requireStub.args[0][0][0];

                    expect(retrieveParams(url).cookieName).toBe('cto2_guardian');
                });

                it('should send correct "varName" param', function () {
                    criteo.load();
                    var url = requireStub.args[0][0][0];

                    expect(retrieveParams(url).varName).toBe('crtg_content');
                });

                it('should send a "rnd" param', function () {
                    criteo.load();
                    var url = requireStub.args[0][0][0];

                    expect(retrieveParams(url).rnd).not.toBeUndefined();
                });

            });

        });

});
