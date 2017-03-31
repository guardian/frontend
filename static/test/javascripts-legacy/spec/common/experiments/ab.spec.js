define([
    'fixtures/ab-test',
    'helpers/injector'
], function (
    ABTest,
    Injector
) {
    describe('AB Testing', function () {
        var test,
            controlSpy,
            variantSpy,
            participationsKey = 'gu.ab.participations',
            getItem = function (testId) {
                return JSON.parse(localStorage.getItem(participationsKey)).value[testId];
            },
            injector = new Injector(),
            ab, config, mvtCookie;

        beforeEach(function (done) {
            injector.require(['common/modules/experiments/ab', 'lib/config', 'common/modules/analytics/mvt-cookie'], function () {
                ab = arguments[0];
                config = arguments[1];
                mvtCookie = arguments[2];

                config.switches = {
                    abDummyTest:  true,
                    abDummyTest2: true
                };

                config.tests = [];

                // a list of ab-tests that can be used in the specs
                test = {
                    one: new ABTest('DummyTest'),
                    two: new ABTest('DummyTest2')
                };

                controlSpy = sinon.spy(test.one.variants[0], 'test');
                variantSpy = sinon.spy(test.one.variants[1], 'test');

                done();
            });
        });

        afterEach(function () {
            ab.reset();
            localStorage.removeItem(participationsKey);
            document.body.removeAttribute('data-link-test');
        });

        describe('Ab', function () {

            it('should exist', function () {
                expect(ab).toBeDefined();
            });

        });

        describe('Start and Expiry dates', function () {

            it('should use Start and Expiry dates in exact ISO 8601 format for consistent parsing across browsers', function () {
                ab.TESTS.forEach(function(test) {
                    expect(test.start).toMatch('\\d{4}-\\d{2}-\\d{2}');
                    expect(test.expiry).toMatch('\\d{4}-\\d{2}-\\d{2}');
                });
            });

        });

        describe('User segmentation', function () {

            it('should not run if switch is off', function () {
                config.switches.abDummyTest = false;

                ab.addTest(test.one);
                ab.segment();

                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('should assign the user to a segment (aka. variant)', function () {
                ab.addTest(test.one);
                ab.addTest(test.two);
                ab.segment();

                expect(getItem('DummyTest').variant).not.toBeUndefined();
                expect(getItem('DummyTest2').variant).not.toBeUndefined();
            });

            it('should put all non-participating users in a "not in test" group', function () {
                test.one.audience = 0;
                ab.addTest(test.one);
                ab.segment();

                expect(controlSpy).not.toHaveBeenCalled();
                expect(getItem('DummyTest').variant).toBe('notintest');
            });

            it('should not segment user if test can\'t be run', function () {
                test.one.canRun = function () { return false; };
                ab.addTest(test.one);
                ab.segment();

                expect(ab.getParticipations()).toEqual({});
            });

            it('should not segment user if the test has expired', function () {
                test.one.expiry = '2012-01-01';
                ab.addTest(test.one);
                ab.segment();

                expect(ab.getParticipations()).toEqual({});
            });

            it('should not segment user if the test is switched off', function () {
                config.switches.abDummyTest = false;

                ab.addTest(test.one);
                ab.segment();

                expect(ab.getParticipations()).toEqual({});
            });

            it('should not segment user if they already belong to the test', function () {
                mvtCookie.overwriteMvtCookie(1);

                ab.addTest(test.one);
                ab.segment();

                expect(ab.getParticipations().DummyTest.variant).toEqual('hide');
            });

            it('should retrieve all the tests user is in', function () {
                ab.addTest(test.one);
                ab.addTest(test.two);
                ab.segment();
                var tests = Object.keys(ab.getParticipations()).map(function (k) { return k; }).toString();

                expect(tests).toBe('DummyTest,DummyTest2');
            });

            it('should remove expired tests from being logged', function () {
                localStorage.setItem(
                    participationsKey,
                    '{ "value": { "DummyTest2": { "variant": "foo" }, "DummyTest": { "variant": "bar" } } }'
                );
                test.one.expiry = '2012-01-01';
                ab.addTest(test.one);
                ab.segment();

                expect(localStorage.getItem(participationsKey)).toBe('{"value":{"DummyTest2":{"variant":"foo"}}}');
            });

            it('should remove participation from tests that have been removed/renamed', function () {
                localStorage.setItem(
                    participationsKey,
                    '{ "value": { "DummyTest": { "variant": "foo" }, "DummyTestDeleted": { "variant": "bar" } } }'
                );
                ab.addTest(test.one);
                ab.segmentUser();
                ab.run();

                expect(localStorage.getItem(participationsKey)).toBe('{"value":{"DummyTest":{"variant":"foo"}}}');
            });

            it('should allow the forcing of users in to a given test and variant', function () {
                ab.addTest(test.one);
                ab.forceSegment('DummyTest', 'bar');
                expect(getItem('DummyTest').variant).toBe('bar');

                // ... and should be able to override
                ab.forceSegment('DummyTest', 'foo');
                expect(getItem('DummyTest').variant).toBe('foo');
            });

        });

        describe('Running tests', function () {

            it('should be able to start test', function () {
                ab.addTest(test.one);
                ab.segment();
                ab.run();

                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });

            it('should run the test until the end of the expiry day', function () {
                //... we need the current date in 'yyyy-mm-dd' format:
                var dateString = new Date().toISOString().substring(0, 10);
                test.one.expiry = dateString;
                ab.addTest(test.one);
                ab.segment();
                ab.run();

                var tests = Object.keys(ab.getParticipations()).map(function (k) { return k; }).toString();

                expect(tests).toBe('DummyTest');
                expect(ab.getExpiredTests().length).toBe(0);
                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });

            it('should not to run the after the expiry date', function () {
                test.one.expiry = '2012-01-01';
                ab.addTest(test.one);
                ab.segment();
                ab.run();

                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

        });

        describe('Analytics', function () {

            it('should return the variant of a test that current user is participating in', function () {
                mvtCookie.overwriteMvtCookie(2);

                ab.addTest(test.one);
                ab.addTest(test.two);
                ab.segment();
                var event = {};
                event.tag = 'most popular | The Guardian | trail | 1 | text';

                expect(ab.getTestVariantId('DummyTest')).toEqual('control');
            });

            it('should generate the correct structure for Ophan', function() {
                ab.addTest(test.one);
                ab.segment();

                expect(ab.getAbLoggableObject()).toEqual({
                    'DummyTest': {
                        variantName: 'control',
                        complete: 'false'
                    }
                });
            });

            it('should fire the success function when canRun is true', function() {
                var spy = sinon.spy();

                ab.addTest(test.one);
                ab.segmentUser();
                test.one.variants[0].success = spy;
                ab.registerCompleteEvents();

                expect(spy).toHaveBeenCalled();
            });

            it('should fire the success function when canRun is false', function() {
                var spy = sinon.spy();

                ab.addTest(test.one);
                ab.segmentUser();
                ab.clearTests();
                test.one.canRun = function() { return false; };
                ab.addTest(test.one);
                test.one.variants[0].success = spy;
                ab.registerCompleteEvents();

                expect(spy).toHaveBeenCalled();
            });

            it('should defer firing the impression when the function is provided', function () {
                var spy = sinon.spy();

                ab.addTest(test.one);
                ab.segmentUser();

                /**
                 * impression events are only registered if every variant has an `impression` function
                 */
                test.one.variants.forEach(function(t) {
                    t.impression = spy;
                });

                ab.registerImpressionEvents();

                expect(spy).toHaveBeenCalled();
            });
        });

    });
});
