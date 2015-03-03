define([
    'modules/vars',
    'modules/bootstrap',
    'test/utils/mockjax',
    'sinon'
], function (
    vars,
    Bootstrap,
    mockjax,
    sinon
) {
    describe('Bootstrap', function () {
        var ajax,
            objects = generateMockObjects();

        beforeEach(function () {
            jasmine.clock().install();
            ajax = mockjax();
        });
        afterEach(function () {
            jasmine.clock().uninstall();
            ajax.clear();
        });

        it('loads all endpoints correctly', function () {
            ajax.apply(null, objects['ajax-success-mock-one']);

            var bootstrap = new Bootstrap(),
                success = sinon.spy(),
                fail = sinon.spy(),
                every = sinon.spy();

            bootstrap
                .onload(success)
                .onfail(fail)
                .every(every);

            jasmine.clock().tick(100);

            expect(fail.called).toBe(false);
            expect(success.called).toBe(true);
            expect(success.getCall(0).args[0]).toEqual(objects['expected-object-one']);
            expect(every.called).toBe(true);
            expect(every.getCall(0).args[0]).toEqual(objects['expected-object-one']);

            ajax.clear();
            // Change the config in the meantime
            ajax.apply(null, objects['ajax-success-mock-two']);

            jasmine.clock().tick(vars.CONST.configSettingsPollMs);
            expect(every.getCall(1).args[0]).toEqual(objects['expected-object-two']);
            // get callbacks should not be called again
            expect(success.calledOnce).toBe(true);


            // Register multiple callbacks
            var one = sinon.spy(),
                two = sinon.spy();

            bootstrap
                .every(one)
                .every(two);

            jasmine.clock().tick(vars.CONST.configSettingsPollMs);
            expect(one.getCall(0).args[0]).toEqual(objects['expected-object-two']);
            expect(two.getCall(0).args[0]).toEqual(objects['expected-object-two']);
            expect(success.calledOnce).toBe(true);

            // dispose the bootstrap, check that 'every' is not called anymore
            bootstrap.dispose();
            jasmine.clock().tick(5 * vars.CONST.configSettingsPollMs);
            expect(every.calledThrice).toBe(true);
        });

        it('fails validation', function () {
            ajax.apply(null, objects['ajax-fail-validation']);

            var bootstrap = new Bootstrap(),
                success = sinon.spy(),
                fail = sinon.spy();

            bootstrap
                .onload(success)
                .onfail(fail);

            jasmine.clock().tick(100);

            expect(fail.called).toBe(true);
            expect(fail.getCall(0).args[0]).toMatch(/config is invalid/);
            expect(success.called).toBe(false);
        });

        it('fails on network error', function () {
            ajax.apply(null, objects['ajax-network-error']);

            var bootstrap = new Bootstrap(),
                success = sinon.spy(),
                fail = sinon.spy();

            bootstrap
                .onload(success)
                .onfail(fail);

            jasmine.clock().tick(100);

            expect(fail.called).toBe(true);
            expect(fail.getCall(0).args[0]).toMatch(/switches is invalid/);
            expect(success.called).toBe(false);
        });

        it('fails in the every callback', function () {
            ajax.apply(null, objects['ajax-success-mock-one']);

            var bootstrap = new Bootstrap(),
                fail = sinon.spy(),
                every = sinon.spy();

            bootstrap.every(every, fail);

            jasmine.clock().tick(100);

            expect(fail.called).toBe(false);
            expect(every.called).toBe(true);
            expect(every.getCall(0).args[0]).toEqual(objects['expected-object-one']);

            ajax.clear();
            ajax.apply(null, objects['ajax-fail-validation']);

            jasmine.clock().tick(vars.CONST.configSettingsPollMs);
            expect(every.calledOnce).toBe(true);
            expect(fail.calledOnce).toBe(true);
        });
    });

    function generateMockObjects () {
        var objects = {};

        objects['ajax-success-mock-one'] = [{
            url: '/config',
            responseText: {
                fronts: ['uk'],
                collections: ['one', 'two']
            }
        }, {
            url: '/switches',
            responseText: {
                'switch-one': false
            }
        }, {
            url: vars.CONST.frontendApiBase + '/config',
            responseText: {
                email: 'yours'
            }
        }];

        objects['expected-object-one'] = {
            config: {
                fronts: ['uk'],
                collections: ['one', 'two']
            },
            switches: {
                'switch-one': false
            },
            defaults: {
                email: 'yours'
            }
        };

        objects['ajax-success-mock-two'] = [{
            url: '/config',
            responseText: {
                fronts: ['uk', 'us'],
                collections: ['one']
            }
        }, {
            url: '/switches',
            responseText: {
                'switch-one': true
            }
        }, {
            url: vars.CONST.frontendApiBase + '/config',
            responseText: {
                email: 'yours'
            }
        }];

        objects['expected-object-two'] = {
            config: {
                fronts: ['uk', 'us'],
                    collections: ['one']
            },
            switches: {
                'switch-one': true
            },
            defaults: {
                email: 'yours'
            }
        };

        objects['ajax-fail-validation'] = [{
            url: '/config',
            responseText: {
                banana: 'yellow'
            }
        }, {
            url: '/switches',
            responseText: {
                'switch-one': false
            }
        }, {
            url: vars.CONST.frontendApiBase + '/config',
            responseText: {
                email: 'yours'
            }
        }];

        objects['ajax-network-error'] = [{
            url: '/config',
            responseText: {
                fronts: ['uk'],
                collections: ['one', 'two']
            }
        }, {
            url: '/switches',
            status: 404
        }, {
            url: vars.CONST.frontendApiBase + '/config',
            responseText: {
                email: 'yours'
            }
        }];

        return objects;
    }
});
