define([
    'common/utils/$',
    'lodash/arrays/zipObject',
    'jasq'
], function (
    $,
    zipObject
) {


    function retrieveParams(url) {
        return zipObject(url.split('?').pop().split('!').shift().split('&').map(function(param) {
            return param.split('=');
        }));
    }

    describe('Criteo', {
        moduleName: 'common/modules/commercial/tags/criteo',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            criteo: true
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
                $('.criteo-script').remove();
                requireStub.restore();
            });

            it('should not load if switch is off', function (criteo, deps) {
                deps['common/utils/config'].switches.criteo = false;

                expect(criteo.load()).toBeFalsy();
            });

            it('should send correct "netid" param', function (criteo) {
                criteo.load();
                var url = requireStub.args[0][0][0];

                expect(retrieveParams(url).netid).toBe('1476');
            });

            it('should send correct "cookieName" param', function (criteo) {
                criteo.load();
                var url = requireStub.args[0][0][0];

                expect(retrieveParams(url).cookieName).toBe('cto2_guardian');
            });

            it('should send correct "varName" param', function (criteo) {
                criteo.load();
                var url = requireStub.args[0][0][0];

                expect(retrieveParams(url).varName).toBe('crtg_content');
            });

            it('should send a "rnd" param', function (criteo) {
                criteo.load();
                var url = requireStub.args[0][0][0];

                expect(retrieveParams(url).rnd).not.toBeUndefined();
            });

        }
    });

});
