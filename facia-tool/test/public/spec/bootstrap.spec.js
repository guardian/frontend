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
        var ajax;

        beforeEach(function () {
            jasmine.clock().install();
            ajax = mockjax();
        });
        afterEach(function () {
            jasmine.clock().install();
            ajax.clear();
        });

        it('loads all endpoints correctly', function () {
            ajax({
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
            });

            var bootstrap = new Bootstrap(),
                success = sinon.spy(),
                fail = sinon.spy(),
                every = sinon.spy();

            bootstrap
                .onload(success)
                .onfail(fail)
                .every(every);

            jasmine.clock().tick(100);

            var expectedObject = {
                config: {
                    fronts: ['uk'],
                    collections: ['one', 'two']
                },
                switches: {
                    'switch-one': false
                }
            };

            expect(fail.called).toBe(false);
            expect(success.called).toBe(true);
            expect(success.getCall(0).args[0]).toEqual(expectedObject);
            expect(every.called).toBe(true);
            expect(every.getCall(0).args[0]).toEqual(expectedObject);

            ajax.clear();
            // Change the config in the meantime
            ajax({
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
            });

            var secondExpectedObject = {
                config: {
                    fronts: ['uk', 'us'],
                    collections: ['one']
                },
                switches: {
                    'switch-one': true
                }
            };

            jasmine.clock().tick(vars.CONST.configSettingsPollMs);
            expect(every.getCall(1).args[0]).toEqual(secondExpectedObject);
            // get callbacks should not be called again
            expect(success.calledOnce).toBe(true);


            // Register multiple callbacks
            var one = sinon.spy(),
                two = sinon.spy();

            bootstrap
                .every(one)
                .every(two);

            jasmine.clock().tick(vars.CONST.configSettingsPollMs);
            expect(one.getCall(0).args[0]).toEqual(secondExpectedObject);
            expect(two.getCall(0).args[0]).toEqual(secondExpectedObject);
            expect(success.calledOnce).toBe(true);

            // dispose the bootstrap, check that 'every' is not called anymore
            bootstrap.dispose();
            jasmine.clock().tick(5 * vars.CONST.configSettingsPollMs);
            expect(every.calledThrice).toBe(true);
        });

        it('fails validation', function () {
            ajax({
                url: '/config',
                responseText: {
                    banana: 'yellow'
                }
            }, {
                url: '/switches',
                responseText: {
                    'switch-one': false
                }
            });

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
            ajax({
                url: '/config',
                responseText: {
                    fronts: ['uk'],
                    collections: ['one', 'two']
                }
            }, {
                url: '/switches',
                status: 404
            });

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
            ajax({
                url: '/config',
                responseText: {
                    fronts: ['every'],
                    collections: ['every']
                }
            }, {
                url: '/switches',
                responseText: {
                    enabled: true
                }
            });

            var bootstrap = new Bootstrap(),
                fail = sinon.spy(),
                every = sinon.spy();

            bootstrap.every(every, fail);

            jasmine.clock().tick(100);

            expect(fail.called).toBe(false);
            expect(every.called).toBe(true);
            expect(every.getCall(0).args[0]).toEqual({
                config: {
                    fronts: ['every'],
                    collections: ['every']
                },
                switches: {
                    enabled: true
                }
            });

            ajax.clear();
            ajax({
                url: '/config',
                status: 500
            }, {
                url: '/switches',
                responseText: {
                    'switch-one': true
                }
            });

            jasmine.clock().tick(vars.CONST.configSettingsPollMs);
            expect(every.calledOnce).toBe(true);
            expect(fail.calledOnce).toBe(true);
        });
    });
});
