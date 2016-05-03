define([
    'common/utils/report-error',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/tests/dummy-test',
    'common/modules/experiments/tests/https-test',
    'common/modules/experiments/tests/fake-series-hide-sensitive',
    'common/modules/experiments/tests/fake-series-show-sensitive',
    'common/modules/experiments/tests/fronts-on-articles2',
    'common/modules/experiments/tests/identity-register-membership-standfirst',
    'common/modules/experiments/tests/live-blog-chrome-notifications-internal',
    'common/modules/experiments/tests/live-blog-chrome-notifications-prod',
    'common/modules/experiments/tests/next-in-series',
    'common/modules/experiments/tests/membership',
    'common/modules/experiments/tests/loyal-adblocking-survey',
    'common/modules/experiments/tests/minute',
    'common/modules/experiments/tests/video-series-page',
    'lodash/arrays/flatten',
    'lodash/arrays/zip',
    'lodash/collections/forEach',
    'lodash/objects/keys',
    'lodash/collections/some',
    'lodash/collections/filter',
    'lodash/collections/map',
    'lodash/collections/reduce',
    'lodash/collections/find',
    'lodash/objects/pick',
    'lodash/utilities/noop',
    'lodash/objects/merge',
    'common/utils/chain'
], function (
    reportError,
    config,
    cookies,
    mediator,
    store,
    mvtCookie,
    DummyTest,
    Https,
    FakeSeriesHideSensitive,
    FakeSeriesShowSensitive,
    FrontsOnArticles2,
    IdentityRegisterMembershipStandfirst,
    LiveBlogChromeNotificationsInternal,
    LiveBlogChromeNotificationsProd,
    NextInSeries,
    Membership,
    LoyalAdblockingSurvey,
    Minute,
    VideoSeriesPage,
    flatten,
    zip,
    forEach,
    keys,
    some,
    filter,
    map,
    reduce,
    find,
    pick,
    noop,
    merge,
    chain
) {

    var TESTS = flatten([
        new DummyTest(),
        new Https(),
        new FrontsOnArticles2(),
        new IdentityRegisterMembershipStandfirst(),
        new LiveBlogChromeNotificationsInternal(),
        new LiveBlogChromeNotificationsProd(),
        new NextInSeries(),
        new Membership(),
        new LoyalAdblockingSurvey(),
        new Minute(),
        new VideoSeriesPage(),
        new FakeSeriesHideSensitive(),
        new FakeSeriesShowSensitive()
    ]);

    var participationsKey = 'gu.ab.participations';

    function getParticipations() {
        return store.local.get(participationsKey) || {};
    }

    function isParticipating(test) {
        var participations = getParticipations();
        return participations[test.id];
    }

    function addParticipation(test, variantId) {
        var participations = getParticipations();
        participations[test.id] = {
            variant: variantId
        };
        store.local.set(participationsKey, participations);
    }

    function removeParticipation(test) {
        var participations = getParticipations();
        delete participations[test.id];
        store.local.set(participationsKey, participations);
    }

    function cleanParticipations() {
        // Removes any tests from localstorage that have been
        // renamed/deleted from the backend
        var participations = getParticipations();
        forEach(keys(participations), function (k) {
            if (typeof (config.switches['ab' + k]) === 'undefined') {
                removeParticipation({ id: k });
            } else {
                var testExists = some(TESTS, function (element) {
                    return element.id === k;
                });

                if (!testExists) {
                    removeParticipation({ id: k });
                }
            }
        });
    }

    function getActiveTests() {
        return filter(TESTS, function (test) {
            var expired = (new Date() - new Date(test.expiry)) > 0;
            if (expired) {
                removeParticipation(test);
                return false;
            }
            return true;
        });
    }

    function getExpiredTests() {
        return filter(TESTS, function (test) {
            return (new Date() - new Date(test.expiry)) > 0;
        });
    }

    function testCanBeRun(test) {
        var expired = (new Date() - new Date(test.expiry)) > 0,
            isSensitive = config.page.shouldHideAdverts;
        return ((isSensitive ? test.showForSensitive : true)
                && test.canRun() && !expired && isTestSwitchedOn(test));
    }

    function getTest(id) {
        var test = filter(TESTS, function (test) {
            return (test.id === id);
        });
        return (test) ? test[0] : '';
    }

    function makeOmnitureTag() {
        var participations = getParticipations(),
            tag = [];

        forEach(keys(participations), function (k) {
            if (testCanBeRun(getTest(k))) {
                tag.push(['AB', k, participations[k].variant].join(' | '));
            }
        });

        forEach(keys(config.tests), function (k) {
            if (k.toLowerCase().match(/^cm/)) {
                tag.push(['AB', k, 'variant'].join(' | '));
            }
        });

        forEach(getServerSideTests(), function (testName) {
            tag.push('AB | ' + testName + ' | inTest');
        });

        return tag.join(',');
    }

    function abData(variantName, complete) {
        return {
            'variantName': variantName,
            'complete': complete
        };
    }

    function getAbLoggableObject() {
        try {
            return reduce(zip(getActiveTests(), getServerSideTests()), function(log, tests) {
                var active = tests[0];
                var server = tests[1];

                if (active && isParticipating(active) && testCanBeRun(active)) {
                    var variant = getTestVariantId(active.id);

                    if (variant && variant !== 'notintest') {
                        log[active.id] = abData(variant, 'false');
                    }
                }

                if (server) {
                    log['ab' + server] = abData('inTest', 'false');
                }

                return log;
            }, {});
        } catch (error) {
            // Encountering an error should invalidate the logging process.
            reportError(error, false);
            return {};
        }
    }

    function trackEvent() {
        recordOphanAbEvent(getAbLoggableObject());
    }

    function recordOphanAbEvent(data) {
        require(['ophan/ng'], function (ophan) {
            ophan.record({
                abTestRegister: data
            });
        });
    }

    function recordTestComplete(test, variantId) {
        var data = {};
        data[test.id] = abData(variantId, 'true');

        return function() {
            recordOphanAbEvent(data);
        };
    }

    // Finds variant in specific tests and runs it
    function run(test) {
        if (isParticipating(test) && testCanBeRun(test)) {
            var participations = getParticipations(),
                variantId = participations[test.id].variant;
            var variant = getVariant(test, variantId);
            if (variant) {
                variant.test();

                var onTestComplete = variant.success || noop;
                onTestComplete(recordTestComplete(test, variantId));
            } else if (variantId === 'notintest' && test.notInTest) {
                test.notInTest();
            }
        }
    }

    function allocateUserToTest(test) {

        // Skip allocation if the user is already participating, or the test is invalid.
        if (!testCanBeRun(test) || isParticipating(test)) {
            return;
        }

        // Determine whether the user is in the test or not. The test population is just a subset of mvt ids.
        // A test population must begin from a specific value. Overlapping test ranges are permitted.
        var variantIds, testVariantId,
            smallestTestId = mvtCookie.getMvtNumValues() * test.audienceOffset,
            largestTestId  = smallestTestId + mvtCookie.getMvtNumValues() * test.audience,
        // Get this browser's mvt test id.
            mvtCookieId = mvtCookie.getMvtValue();

        if (mvtCookieId && mvtCookieId > smallestTestId && mvtCookieId <= largestTestId) {
            // This mvt test id is in the test range, so allocate it to a test variant.
            variantIds = map(test.variants, function (variant) {
                return variant.id;
            });
            testVariantId = mvtCookieId % variantIds.length;

            addParticipation(test, variantIds[testVariantId]);

        } else {
            addParticipation(test, 'notintest');
        }
    }

    function isTestSwitchedOn(test) {
        return config.switches['ab' + test.id];
    }

    function getTestVariantId(testId) {
        var participation = getParticipations()[testId];
        return participation && participation.variant;
    }

    function setTestVariant(testId, variant) {
        var participations = getParticipations();

        if (participations[testId]) {
            participations[testId].variant = variant;
            store.local.set(participationsKey, participations);
        }
    }

    function shouldRunTest(id, variant) {
        var test = getTest(id);
        return test && isParticipating(test) && getTestVariantId(id) === variant && testCanBeRun(test);
    }

    function getVariant(test, variantId) {
        return find(test.variants, function (variant) {
            return variant.id === variantId;
        });
    }

    // These kinds of tests are both server and client side.
    function getServerSideTests() {
        return chain(config.tests)
            .and(pick, function (participating) { return !!participating; })
            .and(keys)
            .value();
    }

    var ab = {

        addTest: function (test) {
            TESTS.push(test);
        },

        clearTests: function () {
            TESTS = [];
        },

        segment: function () {
            forEach(getActiveTests(), function (test) {
                allocateUserToTest(test);
            });
        },

        forceSegment: function (testId, variant) {
            chain(getActiveTests()).and(filter, function (test) {
                    return (test.id === testId);
                }).and(forEach, function (test) {
                    addParticipation(test, variant);
                }).valueOf();
        },

        segmentUser: function () {
            var tokens,
                forceUserIntoTest = /^#ab/.test(window.location.hash);
            if (forceUserIntoTest) {
                tokens = window.location.hash.replace('#ab-', '').split(',');
                forEach(tokens, function (token) {
                    var abParam, test, variant;
                    abParam = token.split('=');
                    test = abParam[0];
                    variant = abParam[1];
                    ab.forceSegment(test, variant);
                });
            } else {
                ab.segment();
            }

            cleanParticipations();
        },

        run: function () {
            forEach(getActiveTests(), function (test) {
                run(test);
            });
        },

        isEventApplicableToAnActiveTest: function (event) {
            var participations = keys(getParticipations());
            return some(participations, function (id) {
                var listOfEventStrings = getTest(id).events;
                return some(listOfEventStrings, function (ev) {
                    return event.indexOf(ev) === 0;
                });
            });
        },

        getActiveTestsEventIsApplicableTo: function (event) {

            function startsWith(string, prefix) {
                return string.indexOf(prefix) === 0;
            }

            var eventTag = event.tag;
            return eventTag && chain(getActiveTests()).and(filter, function (test) {
                    var testEvents = test.events;
                    return testEvents && some(testEvents, function (testEvent) {
                        return startsWith(eventTag, testEvent);
                    });
                }).and(map, function (test) {
                    return test.id;
                }).valueOf();
        },

        getAbLoggableObject: getAbLoggableObject,
        getParticipations: getParticipations,
        isParticipating: isParticipating,
        getTest: getTest,
        makeOmnitureTag: makeOmnitureTag,
        trackEvent: trackEvent,
        getExpiredTests: getExpiredTests,
        getActiveTests: getActiveTests,
        getTestVariantId: getTestVariantId,
        setTestVariant: setTestVariant,
        getVariant: getVariant,

        /**
         * check if a test can be run (i.e. is not expired and switched on)
         *
         * @param  {string|Object} test   id or test object
         * @return {Boolean}
         */
        testCanBeRun: function (test) {
            if (typeof test === 'string') {
                return testCanBeRun(find(TESTS, function (t) {
                    return t.id === test;
                }));
            }

            return test.id && test.expiry && testCanBeRun(test);
        },

        /**
         * returns whether the caller should treat the user as being in that variant.
         *
         * @param testName
         * @param variant
         * @returns {*|boolean|Boolean}
         */
        isInVariant: function (testName, variant) {
            return ab.getParticipations()[testName] &&
                (ab.getParticipations()[testName].variant === variant) &&
                ab.testCanBeRun(testName);
        },

        shouldRunTest: shouldRunTest,

        // testing
        reset: function () {
            TESTS = [];
        }
    };

    return ab;

});
