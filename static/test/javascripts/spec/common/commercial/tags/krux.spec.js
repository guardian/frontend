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
                $('.krux-script').remove();
                requireStub.restore();
            });

            it('should not load if switch is off', function (krux, deps) {
                deps['common/utils/config'].switches.krux = false;

                expect(krux.load()).toBeFalsy();
            });
        }
    });

});
