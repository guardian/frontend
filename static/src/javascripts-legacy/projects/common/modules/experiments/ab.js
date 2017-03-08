define([
    'lib/report-error',
    'lib/config',
    'lib/cookies',
    'lib/mediator',
    'lib/storage',
    'lodash/arrays/compact',
    'lodash/utilities/noop',
    'common/modules/experiments/segment-util',
    'common/modules/experiments/tests/editorial-email-variants',
    'common/modules/experiments/tests/opinion-email-variants',
    'common/modules/experiments/tests/recommended-for-you',
    'common/modules/experiments/tests/membership-engagement-banner-tests',
    'common/modules/experiments/tests/paid-content-vs-outbrain',
    'common/modules/experiments/tests/guardian-today-messaging',
    'common/modules/experiments/acquisition-test-selector',
    'common/modules/experiments/tests/tailor-recommended-email',
    'common/modules/experiments/tests/membership-a3-a4-bundles-thrasher',
    'common/modules/experiments/tests/tailor-survey',
    'common/modules/experiments/tests/sleeve-notes-new-email-variant',
    'common/modules/experiments/tests/sleeve-notes-legacy-email-variant',
    'ophan/ng'
], function (reportError,
             config,
             cookies,
             mediator,
             store,
             compact,
             noop,
             segmentUtil,
             EditorialEmailVariants,
             OpinionEmailVariants,
             RecommendedForYou,
             MembershipEngagementBannerTests,
             PaidContentVsOutbrain,
             GuardianTodayMessaging,
             acquisitionTestSelector,
             TailorRecommendedEmail,
             MembershipA3A4BundlesThrasher,
             TailorSurvey,
             SleevenotesNewEmailVariant,
             SleevenotesLegacyEmailVariant,
             ophan
    ) {
    var TESTS = compact([
        new EditorialEmailVariants(),
        new OpinionEmailVariants(),
        new RecommendedForYou(),
        new PaidContentVsOutbrain,
        new GuardianTodayMessaging(),
        acquisitionTestSelector.getTest(),
        new TailorRecommendedEmail(),
        new MembershipA3A4BundlesThrasher(),
        new TailorSurvey(),
        SleevenotesNewEmailVariant,
        SleevenotesLegacyEmailVariant
    ].concat(MembershipEngagementBannerTests));

    var participationsKey = 'gu.ab.participations';

    function getParticipations() {
        return store.local.get(participationsKey) || {};
    }

    function isParticipating(test) {
        var participations = getParticipations();
        return test.id in participations;
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
        var filteredParticipations = Object.keys(participations)
            .filter(function (participation) {
                return participation !== test.id;
            })
            .reduce(function (result, input) {
                result[input] = participations[input];
                return result;
            }, {});
        store.local.set(participationsKey, filteredParticipations);
    }

    function cleanParticipations() {
        // Removes any tests from localstorage that have been
        // renamed/deleted from the backend
        Object.keys(getParticipations()).forEach(function (k) {
            if (typeof config.switches['ab' + k] === 'undefined') {
                removeParticipation({id: k});
            } else {
                var testExists = TESTS.some(function (element) {
                    return element.id === k;
                });

                if (!testExists) {
                    removeParticipation({id: k});
                }
            }
        });
    }

    function isExpired(testExpiry) {
      // new Date(test.expiry) sets the expiry time to 00:00:00
      // Using SetHours allows a test to run until the END of the expiry day
      var startOfToday = new Date().setHours(0,0,0,0);
      return startOfToday > new Date(testExpiry);
    }

    function getActiveTests() {
        return TESTS.filter(function (test) {
            if (isExpired(test.expiry)) {
                removeParticipation(test);
                return false;
            }
            return true;
        });
    }

    function getExpiredTests() {
        return TESTS.filter(function (test) {
            return isExpired(test.expiry);
        });
    }

    function testCanBeRun(test) {
        var expired = isExpired(test.expiry),
            isSensitive = config.page.isSensitive;

        return ((isSensitive ? test.showForSensitive : true)
            && isTestSwitchedOn(test)) && !expired && test.canRun();
    }

    function getId(test) {
        return test.id;
    }

    function getTest(id) {
        var testIndex = TESTS.map(getId).indexOf(id);
        return testIndex !== -1 ? TESTS[testIndex] : '';
    }

    function makeOmnitureTag() {
        var participations = getParticipations(),
            tag = [];

        Object.keys(participations)
            .map(getTest)
            .filter(testCanBeRun)
            .forEach(function (test) {
                tag.push('AB | ' + test.id + ' | ' + participations[test.id].variant);
            });

        Object.keys(config.tests)
            .filter(function (k) {
                return k.toLowerCase().indexOf('cm') === 0;
            })
            .forEach(function (k) {
                tag.push('AB | ' + k + ' | variant');
            });

        getServerSideTests().forEach(function (testName) {
            tag.push('AB | ' + testName + ' | inTest');
        });

        return tag.join(',');
    }

    function abData(variantName, complete, campaignCodes) {
        var data = {
            'variantName': variantName,
            'complete': complete
        }

        if (campaignCodes) {
            data.campaignCodes = campaignCodes;
        }

        return data;
    }

    function getAbLoggableObject() {
        try {
            var log = {};

            getActiveTests()
                .filter(not(defersImpression))
                .filter(isParticipating)
                .filter(testCanBeRun)
                .forEach(function (test) {
                    var variantId = getTestVariantId(test.id);
                    var variant = getVariant(test, variantId);

                    if (variantId && segmentUtil.isInTest(test)) {
                        log[test.id] = abData(variantId, 'false', variant.campaignCodes);
                    }
                });

            getServerSideTests().forEach(function (test) {
                log['ab' + test] = abData('inTest', 'false');
            });

            return log;
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
        ophan.record({
            abTestRegister: data
        });
    }

    /**
     * Register a test and variant's complete state with Ophan
     *
     * @param test
     * @param {string} variantId
     * @param {boolean} complete
     * @returns {Function} to fire the event
     */
    function recordTestComplete(test, variantId, complete) {
        var data = {};
        var variant = getVariant(test, variantId);

        data[test.id] = abData(variantId, String(complete), variant.campaignCodes);

        return function () {
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
            } else if (!segmentUtil.isInTest(test) && test.notInTest) {
                test.notInTest();
            }
        }
    }

    function allocateUserToTest(test) {
        // Only allocate the user if the test is valid and they're not already participating.
        if (testCanBeRun(test) && !isParticipating(test)) {
            addParticipation(test, segmentUtil.variantIdFor(test));
        }
    }

    /**
     * Create a function that sets up listener to fire an Ophan `complete` event. This is used in the `success` and
     * `impression` properties of test variants to allow test authors to control when these events are sent out.
     *
     * @see {@link defersImpression}
     * @param {Boolean} complete
     * @returns {Function}
     */
    function registerCompleteEvent(complete) {
        return function initListener(test) {

            var variantId = getTestVariantId(test.id);

            if (variantId && variantId !== 'notintest') {
                var variant = getVariant(test, variantId);
                var listener = (complete ? variant.success : variant.impression) || noop;

                try {
                    listener(recordTestComplete(test, variantId, complete));
                } catch (err) {
                    reportError(err, false, false);
                }
            }
        };
    }

    /**
     * Checks if this test will defer its impression by providing its own impression function.
     *
     * If it does, the test won't be included in the Ophan call that happens at pageload, and must fire the impression
     * itself via the callback passed to the `impression` property in the variant.
     *
     * @param test
     * @returns {boolean}
     */
    function defersImpression(test) {
        return test.variants.every(function (variant) {
            return typeof variant.impression === 'function';
        });
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
        var index = test.variants.map(getId).indexOf(variantId);
        return index === -1 ? null : test.variants[index];
    }

    // These kinds of tests are both server and client side.
    function getServerSideTests() {
        return Object.keys(config.tests).filter(function (test) {
            return !!config.tests[test];
        });
    }

    function not(f) {
        return function () {
            return !f.apply(this, arguments);
        };
    }

    var ab = {

        addTest: function (test) {
            TESTS.push(test);
        },

        clearTests: function () {
            TESTS = [];
        },

        segment: function () {
            getActiveTests().forEach(function (test) {
                allocateUserToTest(test);
            });
        },

        forceSegment: function (testId, variant) {
            getActiveTests().filter(function (test) {
                return test.id === testId;
            }).forEach(function (test) {
                addParticipation(test, variant);
            });
        },

        forceVariantCompleteFunctions: function (testId, variantId) {
            var test = getTest(testId);

            var variant = test && test.variants.filter(function (v) {
                return v.id.toLowerCase() === variantId.toLowerCase();
            })[0];

            var impression = variant && variant.impression || noop;
            var complete = variant && variant.success || noop;

            impression(recordTestComplete(test, variantId, false));
            complete(recordTestComplete(test, variantId, true));
        },

        segmentUser: function () {
            var tokens,
                forceUserIntoTest = /^#ab/.test(window.location.hash);
            if (forceUserIntoTest) {
                tokens = window.location.hash.replace('#ab-', '').split(',');
                tokens.forEach(function (token) {
                    var abParam, test, variant;
                    abParam = token.split('=');
                    test = abParam[0];
                    variant = abParam[1];
                    ab.forceSegment(test, variant);
                    ab.forceVariantCompleteFunctions(test, variant);
                });
            } else {
                ab.segment();
            }

            cleanParticipations();
        },

        run: function () {
            getActiveTests().forEach(run);
        },

        registerCompleteEvents: function () {
            getActiveTests().forEach(registerCompleteEvent(true));
        },

        registerImpressionEvents: function () {
            getActiveTests().filter(defersImpression).forEach(registerCompleteEvent(false));
        },

        isEventApplicableToAnActiveTest: function (event) {
            return Object.keys(getParticipations()).some(function (id) {
                var listOfEventStrings = getTest(id).events;
                return listOfEventStrings.some(function (ev) {
                    return event.indexOf(ev) === 0;
                });
            });
        },

        getActiveTestsEventIsApplicableTo: function (event) {
            var eventTag = event.tag;
            return eventTag && getActiveTests().filter(function (test) {
                    var testEvents = test.events;
                    return testEvents && testEvents.some(function (testEvent) {
                            return eventTag.indexOf(testEvent) === 0;
                        });
                }).map(getId);
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
        TESTS: TESTS,

        /**
         * check if a test can be run (i.e. is not expired and switched on)
         *
         * @param  {string|Object} test   id or test object
         * @return {Boolean}
         */
        testCanBeRun: function (test) {
            if (typeof test === 'string') {
                test = getTest(test);
                return test && testCanBeRun(test);
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
            segmentUtil.variantIdFor.cache = {};
        }
    };

    return ab;

});
