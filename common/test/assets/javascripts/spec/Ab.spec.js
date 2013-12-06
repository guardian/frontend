define(['modules/experiments/ab', 'fixtures/ab-test', 'modules/analytics/mvt-cookie'], function(ab, ABTest, mvtCookie) {

    describe('AB Testing', function() {

        var test,
            controlSpy,
            variantSpy,
            participationsKey = 'gu.ab.participations',
            getItem = function (testId) {
                return JSON.parse(localStorage.getItem(participationsKey)).value[testId];
            };

        beforeEach(function() {

            ab.clearTests();
            mvtCookie.overwriteMvtCookie(1);

            // a list of ab-tests that can be used in the spec's 
            test = {
                one: new ABTest('DummyTest'),
                two: new ABTest('DummyTest2')
            };

            // a set of switches in various states
            switches = {
                test_one_off: { switches: { abDummyTest: false }},
                test_one_on: { switches: { abDummyTest: true }},
                both_tests_on: { switches: { abDummyTest: true, abDummyTest2: true }}
            };

            controlSpy = sinon.spy(test.one.variants[0], 'test');
            variantSpy = sinon.spy(test.one.variants[1], 'test');

            ab.addTest(test.one);
        });

        afterEach(function() {
            ab.clearTests();
            localStorage.removeItem(participationsKey);
            document.body.removeAttribute('data-link-test');
        });

        describe("Ab", function () {

            it('should exist', function() {
                expect(ab).toBeDefined();
            });

        });

        describe("User segmentation", function () {

            it('should not run if switch is off', function() {
                ab.segment(switches.test_one_off);
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('should assign the user to a segment (aka. variant)', function() {
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                expect(getItem('DummyTest').variant).not.toBeUndefined();
                expect(getItem('DummyTest2').variant).not.toBeUndefined();
            });

            it('should put all non-participating users in a "not in test" group', function() {
                test.one.audience = 0;
                ab.segment(switches.test_one_on);
                expect(controlSpy).not.toHaveBeenCalled();
                expect(getItem('DummyTest').variant).toBe("notintest");
            });

            it("should not segment user if test can't be run", function() {
                test.one.canRun = function() { return false; };
                ab.segment(switches.test_one_on);
                expect(ab.getParticipations()).toEqual([]);
            });

            it("should not segment user if the test has expired", function() {
                test.one.expiry = '2012-01-01';
                ab.segment(switches.test_one_on);
                expect(ab.getParticipations()).toEqual([]);
            });

            it("should not segment user if the test is switched off", function() {
                ab.segment(switches.test_one_off);
                expect(ab.getParticipations()).toEqual([]);
            });

            it("should not segment user if they already belong to the test", function() {

                mvtCookie.overwriteMvtCookie(1);
                ab.segment(switches.test_one_on);
                expect(ab.getParticipations()['DummyTest'].variant).toEqual('hide');

                mvtCookie.overwriteMvtCookie(1);
                ab.segment(switches.test_one_on);
                expect(ab.getParticipations()['DummyTest'].variant).toEqual('hide');
            });

            it('should retrieve all the tests user is in', function() {
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                var tests = Object.keys(ab.getParticipations()).map(function(k){ return k; }).toString();
                expect(tests).toBe('DummyTest,DummyTest2');
            });

            it('should remove expired tests from being logged', function () {
                localStorage.setItem(participationsKey, '{ "value": { "DummyTest2": { "variant": "foo" }, "DummyTest": { "variant": "bar" } } }');
                test.one.expiry = "2012-01-01";
                ab.segment(switches.test_one_on);
                expect(localStorage.getItem(participationsKey)).toBe('{"value":{"DummyTest2":{"variant":"foo"}}}');
            });

            it('should remove participation from tests that have been removed/renamed', function () {
                localStorage.setItem(participationsKey, '{ "value": { "DummyTest": { "variant": "foo" }, "DummyTestDeleted": { "variant": "bar" } } }');
                ab.segmentUser(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(localStorage.getItem(participationsKey)).toBe('{"value":{"DummyTest":{"variant":"foo"}}}');
            })

            it('should allow the forcing of users in to a given test and variant', function () {
                ab.forceSegment('DummyTest', 'bar');
                expect(getItem('DummyTest').variant).toBe('bar');
                // ... and should be able to override 
                ab.forceSegment('DummyTest', 'foo');
                expect(getItem('DummyTest').variant).toBe('foo');
            });

        });

        describe("Running tests", function () {

            it('should be able to start test', function() {
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });

            it('should not to run the after the expiry date', function () {
                test.one.expiry = "2012-01-01";
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('The current DOM context should be passed to the test variant functions', function() {
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on, document.createElement('div'));
                expect(test.one.variants[1].test.lastCall.args[0].nodeName).toBe('DIV');
            });

        });

        describe("Analytics", function () {

            it('should tell me if an event is applicable to a test that I belong to', function () {
                ab.segment(switches.test_one_on);
                expect(ab.isEventApplicableToAnActiveTest('most popular | The Guardian | trail | 1 | text')).toBeTruthy()

            });

            it('should tell me if an event is applicable to a test with multiple event strings that I belong to', function () {
                ab.segment(switches.test_one_on);
                expect(ab.isEventApplicableToAnActiveTest('most popular | Section | trail | 1 | text')).toBeTruthy()
            });

            it('should return a list of test names that are relevant to the event', function () {
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                var event = {};
                event.tag = 'most popular | The Guardian | trail | 1 | text';
                expect(ab.getActiveTestsEventIsApplicableTo(event)).toEqual(['DummyTest', 'DummyTest2'])
            });

            it('should return the variant of a test that current user is participating in', function () {
                ab.addTest(test.two);
                mvtCookie.overwriteMvtCookie(2);
                ab.segment(switches.both_tests_on);
                var event = {};
                event.tag = 'most popular | The Guardian | trail | 1 | text';
                expect(ab.getTestVariant('DummyTest')).toEqual('control')
            });

            it('should generate a string for Omniture to tag the test(s) the user is in', function() {
                test.two.audience = 1;
                ab.addTest(test.two);
                mvtCookie.overwriteMvtCookie(2);
                ab.segment(switches.both_tests_on);
                ab.run(switches.both_tests_on);
                expect(ab.makeOmnitureTag(switches.both_tests_on)).toBe("AB | DummyTest | control,AB | DummyTest2 | control");

            });

            it('should generate Omniture tags when there is two tests, but one cannot run', function() {
                test.one.canRun = function() { return false; };
                ab.addTest(test.one);
                test.two.audience = 1;
                ab.addTest(test.two);
                mvtCookie.overwriteMvtCookie(2);
                ab.segment(switches.both_tests_on);
                ab.run(switches.both_tests_on);
                expect(ab.makeOmnitureTag(switches.both_tests_on)).toBe("AB | DummyTest2 | control");
            });

            it('should not generate Omniture tags when a test can not be run', function() {
                test.two.canRun = function() { return false; };
                ab.addTest(test.two);
                mvtCookie.overwriteMvtCookie(2);
                ab.segment(switches.both_tests_on);
                ab.run(switches.both_tests_on);
                expect(ab.makeOmnitureTag(switches.both_tests_on)).toBe("AB | DummyTest | control");
            });

        });

    });
});
