define([
    'lib/report-error',
    'lib/config',
    'lib/cookies',
    'lib/mediator',
    'lib/storage',
    'lodash/arrays/compact',
    'lodash/utilities/noop',
    'common/modules/experiments/utils',
    'common/modules/experiments/segment-util',
    'common/modules/experiments/test-can-run-checks',
    'common/modules/experiments/acquisition-test-selector',
    'common/modules/experiments/tests/editorial-email-variants',
    'common/modules/experiments/tests/opinion-email-variants',
    'common/modules/experiments/tests/membership-engagement-banner-tests',
    'common/modules/experiments/tests/tailor-survey',
    'common/modules/experiments/tests/the-long-read-email-variants',
    'common/modules/experiments/tests/fashion-statement-email-variants',
    'common/modules/experiments/tests/bookmarks-email-variants-2',
    'common/modules/experiments/tests/film-today-email-variants',
    'common/modules/experiments/tests/sleeve-notes-new-email-variant',
    'common/modules/experiments/tests/sleeve-notes-legacy-email-variant',
    'common/modules/experiments/tests/increase-inline-ads',
    'common/modules/experiments/tests/email-demand-tests',
    'common/modules/experiments/tests/paid-card-logo',
    'ophan/ng',
    'common/modules/experiments/tests/paid-commenting'
], function (reportError,
             config,
             cookies,
             mediator,
             store,
             compact,
             noop,
             abUtils,
             segmentUtil,
             testCanRunChecks,
             acquisitionTestSelector,
             EditorialEmailVariants,
             OpinionEmailVariants,
             MembershipEngagementBannerTests,
             TailorSurvey,
             TheLongReadEmailVariants,
             FashionStatementEmailVariants,
             BookmarksEmailVariants2,
             FilmTodayEmailVariants,
             SleevenotesNewEmailVariant,
             SleevenotesLegacyEmailVariant,
             increaseInlineAdsRedux,
             EmailDemandTests,
             PaidCardLogo,
             ophan,
             PaidCommenting
    ) {
    var TESTS = compact([
        new EditorialEmailVariants(),
        new OpinionEmailVariants(),
        acquisitionTestSelector.getTest(),
        new TailorSurvey(),
        TheLongReadEmailVariants,
        FashionStatementEmailVariants,
        BookmarksEmailVariants2,
        FilmTodayEmailVariants,
        SleevenotesNewEmailVariant,
        SleevenotesLegacyEmailVariant,
        new increaseInlineAdsRedux(),
        new EmailDemandTests(),
        new PaidCardLogo(),
        new PaidCommenting()
    ].concat(MembershipEngagementBannerTests));

    function cleanParticipations() {
        // Removes any tests from localstorage that have been
        // renamed/deleted from the backend
        Object.keys(abUtils.getParticipations()).forEach(function (k) {
            if (typeof config.switches['ab' + k] === 'undefined') {
                abUtils.removeParticipation({id: k});
            } else {
                var testExists = TESTS.some(function (element) {
                    return element.id === k;
                });

                if (!testExists) {
                    abUtils.removeParticipation({id: k});
                }
            }
        });
    }

    function getActiveTests() {
        return TESTS.filter(function (test) {
            if (testCanRunChecks.isExpired(test.expiry)) {
                abUtils.removeParticipation(test);
                return false;
            }
            return true;
        });
    }

    function getExpiredTests() {
        return TESTS.filter(function (test) {
            return testCanRunChecks.isExpired(test.expiry);
        });
    }

    function getTest(id) {
        var testIds = TESTS.map(function (test) {
            return test.id;
        });
        var index = testIds.indexOf(id);
        return index > -1 ? TESTS[index] : null;
    }

    function abData(variantName, complete, campaignCodes) {
        var data = {
            'variantName': variantName,
            'complete': complete
        };

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
                .filter(abUtils.isParticipating)
                .filter(testCanRunChecks.testCanBeRun)
                .forEach(function (test) {
                    var variantId = abUtils.getTestVariantId(test.id);
                    var variant = abUtils.getVariant(test, variantId);
                    var campaingCodes = (variant && variant.campaignCodes) ? variant.campaignCodes : undefined;

                    if (variantId && segmentUtil.isInTest(test)) {
                        log[test.id] = abData(variantId, 'false', campaingCodes);
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
        var variant = abUtils.getVariant(test, variantId);

        data[test.id] = abData(variantId, String(complete), variant.campaignCodes);

        return function () {
            recordOphanAbEvent(data);
        };
    }

    // Finds variant in specific tests and runs it
    function run(test) {
        if (abUtils.isParticipating(test) && testCanRunChecks.testCanBeRun(test)) {
            var participations = abUtils.getParticipations(),
                variantId = participations[test.id].variant;
            var variant = abUtils.getVariant(test, variantId);
            if (variant) {
                variant.test();
            } else if (!segmentUtil.isInTest(test) && test.notInTest) {
                test.notInTest();
            }
        }
    }

    function allocateUserToTest(test) {
        // Only allocate the user if the test is valid and they're not already participating.
        if (testCanRunChecks.testCanBeRun(test) && !abUtils.isParticipating(test)) {
            abUtils.addParticipation(test, segmentUtil.variantIdFor(test));
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

            var variantId = abUtils.getTestVariantId(test.id);

            if (variantId && variantId !== 'notintest') {
                var variant = abUtils.getVariant(test, variantId);
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

    function shouldRunTest(id, variant) {
        var test = getTest(id);
        return test &&
            abUtils.isParticipating(test) &&
            abUtils.getTestVariantId(id) === variant &&
            testCanRunChecks.testCanBeRun(test);
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

    function getForcedIntoTests() {
        var devtoolsAbTests = JSON.parse(store.local.get('gu.devtools.ab')) || [];
        var tokens;

        if (/^#ab/.test(window.location.hash)) {
            tokens = window.location.hash.replace('#ab-', '').split(',');

            return tokens.map(function (token) {
                var abParam = token.split('=');

                return {
                    id: abParam[0],
                    variant: abParam[1]
                };
            });
        }

        return devtoolsAbTests;
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
                abUtils.addParticipation(test, variant);
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
            var forcedIntoTests = getForcedIntoTests();

            if (forcedIntoTests.length) {
                forcedIntoTests.forEach(function (test) {
                    ab.forceSegment(test.id, test.variant);
                    ab.forceVariantCompleteFunctions(test.id, test.variant);
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

        getAbLoggableObject: getAbLoggableObject,
        getParticipations: abUtils.getParticipations,
        isParticipating: abUtils.isParticipating,
        getTest: getTest,
        trackEvent: trackEvent,
        getExpiredTests: getExpiredTests,
        getActiveTests: getActiveTests,
        getTestVariantId: abUtils.getTestVariantId,
        setTestVariant: abUtils.setTestVariant,
        getVariant: abUtils.getVariant,
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
                return test && testCanRunChecks.testCanBeRun(test);
            }

            return test.id && test.expiry && testCanRunChecks.testCanBeRun(test);
        },

        isInVariant: abUtils.isInVariant,

        shouldRunTest: shouldRunTest,

        // testing
        reset: function () {
            TESTS = [];
            segmentUtil.variantIdFor.cache = {};
        }
    };

    return ab;

});
