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
            injector.require(['common/modules/experiments/ab', 'common/utils/config', 'common/modules/analytics/mvt-cookie'], function () {
                ab = arguments[0];
                config = arguments[1];
                mvtCookie = arguments[2];

                config.switches = {
                    abDummyTest:  true,
                    abDummyTest2: true
                };

                config.tests = [];

                // a list of ab-tests that can be used in the spec's
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

            it('should not to run the after the expiry date', function () {
                test.one.expiry = '2012-01-01';
                ab.addTest(test.one);
                ab.segment();
                ab.run();

                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

        });

        describe('Analytics', function () {

            it('should tell me if an event is applicable to a test that I belong to', function () {
                ab.addTest(test.one);
                ab.segment();

                expect(ab.isEventApplicableToAnActiveTest('most popular | The Guardian | trail | 1 | text')).toBeTruthy();

            });

            it('should tell me if an event is applicable to a test with multiple event strings that I belong to', function () {
                ab.addTest(test.one);
                ab.segment();

                expect(ab.isEventApplicableToAnActiveTest('most popular | Section | trail | 1 | text')).toBeTruthy();
            });

            it('should return a list of test names that are relevant to the event', function () {
                ab.addTest(test.one);
                ab.addTest(test.two);
                ab.segment();
                var event = {};
                event.tag = 'most popular | The Guardian | trail | 1 | text';

                expect(ab.getActiveTestsEventIsApplicableTo(event)).toEqual(['DummyTest', 'DummyTest2']);
            });

            it('should return the variant of a test that current user is participating in', function () {
                mvtCookie.overwriteMvtCookie(2);

                ab.addTest(test.one);
                ab.addTest(test.two);
                ab.segment();
                var event = {};
                event.tag = 'most popular | The Guardian | trail | 1 | text';

                expect(ab.getTestVariantId('DummyTest')).toEqual('control');
            });

            it('should generate a string for Omniture to tag the test(s) the user is in', function () {
                mvtCookie.overwriteMvtCookie(2);

                test.two.audience = 1;
                ab.addTest(test.one);
                ab.addTest(test.two);
                ab.segment();
                ab.run();

                expect(ab.makeOmnitureTag()).toBe('AB | DummyTest | control,AB | DummyTest2 | control');

            });

            it('should generate Omniture tags when there is two tests, but one cannot run', function () {
                mvtCookie.overwriteMvtCookie(2);
                test.one.canRun = function () { return false; };
                ab.addTest(test.one);
                test.two.audience = 1;
                ab.addTest(test.two);
                ab.segment();
                ab.run();

                expect(ab.makeOmnitureTag()).toBe('AB | DummyTest2 | control');
            });

            it('should not generate Omniture tags when a test can not be run', function () {
                mvtCookie.overwriteMvtCookie(2);

                ab.addTest(test.one);
                test.two.canRun = function () { return false; };
                ab.addTest(test.two);
                ab.segment();
                ab.run();

                expect(ab.makeOmnitureTag()).toBe('AB | DummyTest | control');
            });

        });

        describe('getTestsAndVariants', function () {
            it('Expresses the running tests and variants as a simple object', function () {
                localStorage.setItem(
                    participationsKey,
                    '{ "value": { "FooTest": { "variant": "foo" }, "BarTest": { "variant": "bar" } } }'
                );

                expect(ab.getTestsAndVariants()).toEqual({
                    FooTest : 'foo',
                    BarTest : 'bar'
                });
            });
        });

    });
});
