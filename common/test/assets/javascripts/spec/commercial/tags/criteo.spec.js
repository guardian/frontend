define([
    'common/utils/$',
    'lodash/arrays/zipObject',
    'common/modules/commercial/tags/criteo'
], function(
    $,
    _zipObject,
    criteo
){

    var requireStub,
        createSwitch = function(switchValue) {
            return {
                switches: {
                    criteo: switchValue
                }
            };
        },
        retrieveParams = function(url) {
            return _zipObject(url.split('?').pop().split('!').shift().split('&').map(function(param) {
                return param.split('=');
            }));
        };

    describe('Criteo', function() {

        beforeEach(function() {
            requireStub = sinon.stub(window, 'require');
        });

        afterEach(function() {
            $('.criteo-script').remove();
            requireStub.restore();
        });

        it('should not load if switch is off', function() {
            expect(criteo.load(createSwitch(false))).toBeFalsy();
        });

        it('should send correct "netid" param', function() {
            criteo.load(createSwitch(true));
            var url = requireStub.args[0][0][0];
            expect(retrieveParams(url).netid).toBe('1476');
        });

        it('should send correct "cookieName" param', function() {
            criteo.load(createSwitch(true));
            var url = requireStub.args[0][0][0];
            expect(retrieveParams(url).cookieName).toBe('cto2_guardian');
        });

        it('should send correct "varName" param', function() {
            criteo.load(createSwitch(true));
            var url = requireStub.args[0][0][0];
            expect(retrieveParams(url).varName).toBe('crtg_content');
        });

        it('should send a "rnd" param', function() {
            criteo.load(createSwitch(true));
            var url = requireStub.args[0][0][0];
            expect(retrieveParams(url).rnd).not.toBeUndefined();
        });

    });

});
