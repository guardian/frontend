define([
    'common/$',
    'lodash/arrays/zipObject',
    'common/modules/analytics/commercial/tags/common/criteo'
], function(
    $,
    _zipObject,
    criteo
){

    function createSwitch(switchValue) {
        return {
            switches: {
                criteo: switchValue
            }
        };
    };

    function retrieveParams(url) {
        return _zipObject(url.split('?').pop().split('&').map(function(param) {
            return param.split('=');
        }));
    };

    describe('Criteo', function() {

        afterEach(function() {
            $('.criteo-script').remove();
        });

        it('should not load if switch is off', function() {
            expect(criteo.load(createSwitch(false))).toBeFalsy();
        });

        it('should return a script element', function() {
            var script = criteo.load(createSwitch(true));
            expect(script.nodeName.toLowerCase()).toBe('script');
        });

        it('should append the script to the head', function() {
            var script = criteo.load(createSwitch(true));
            expect($('head script').last()[0]).toBe(script);
        });

        it('should send correct "netid" param', function() {
            var params = retrieveParams(criteo.load(createSwitch(true)).src);
            expect(params.netid).toBe('1476');
        });

        it('should send correct "cookieName" param', function() {
            var params = retrieveParams(criteo.load(createSwitch(true)).src);
            expect(params.cookieName).toBe('cto2_guardian');
        });

        it('should send correct "varName" param', function() {
            var params = retrieveParams(criteo.load(createSwitch(true)).src);
            expect(params.varName).toBe('crtg_content');
        });

        it('should send a "rnd" param', function() {
            var params = retrieveParams(criteo.load(createSwitch(true)).src);
            // it's random, so just check it exits
            expect(params.rnd).not.toBeUndefined();
        });

    });

});
