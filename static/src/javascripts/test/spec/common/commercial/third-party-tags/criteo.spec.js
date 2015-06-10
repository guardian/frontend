import _ from 'common/utils/_'
import $ from 'common/utils/$'
import Injector from 'helpers/injector'

describe('Criteo', function () {

    function retrieveParams(url) {
        return _.zipObject(url.split('?').pop().split('!').shift().split('&').map(function(param) {
            return param.split('=');
        }));
    }

    var requireStub,
        injector = new Injector(),
        criteo, config;

    beforeEach(function (done) {
        injector.test(['common/modules/commercial/third-party-tags/criteo', 'common/utils/config'], function () {
            criteo = arguments[0];
            config = arguments[1];

            config.switches = {
                criteo: true
            };
            requireStub = sinon.stub(window, 'require');
            done();
        });        
    });

    afterEach(function () {
        $('.criteo-script').remove();
        requireStub.restore();
    });

    it('should not load if switch is off', function () {
        config.switches.criteo = false;

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
