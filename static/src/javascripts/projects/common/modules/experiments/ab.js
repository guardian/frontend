define([
    'common/utils/report-error',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/analytics/mvt-cookie',
    'lodash/functions/memoize',
    'lodash/utilities/noop',
    'common/modules/experiments/tests/fronts-on-articles2',
    'common/modules/experiments/tests/live-blog-chrome-notifications-internal',
    'common/modules/experiments/tests/live-blog-chrome-notifications-prod',
    'common/modules/experiments/tests/facebook-share-params',
    'common/modules/experiments/tests/clever-friend-brexit',
    'common/modules/experiments/tests/participation-discussion-test',
    'common/modules/experiments/tests/new-user-adverts-disabled',
    'common/modules/experiments/tests/video-football-thrasher',
    'common/modules/experiments/tests/video-yellow-button'
], function (
    reportError,
    config,
    cookies,
    mediator,
    store,
    mvtCookie,
    memoize,
    noop,
    FrontsOnArticles2,
    LiveBlogChromeNotificationsInternal,
    LiveBlogChromeNotificationsProd,
    FacebookShareParams,
    CleverFriendBrexit,
    ParticipationDiscussionTest,
    NewUserAdvertsDisabled,
    VideoFootballThrasher,
    VideoYellowPlayButton
) {

    var TESTS = [
        new FrontsOnArticles2(),
        new LiveBlogChromeNotificationsInternal(),
        new LiveBlogChromeNotificationsProd(),
        new FacebookShareParams(),
        new CleverFriendBrexit(),
        new ParticipationDiscussionTest(),
        new NewUserAdvertsDisabled(),
        new VideoFootballThrasher(),
        new VideoYellowPlayButton()
    ];

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
        var filteredParticipations = Object.keys(participations)
            .filter(function (participation) { return participation !== test.id; })
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
                removeParticipation({ id: k });
            } else {
                var testExists = TESTS.some(function (element) {
                    return element.id === k;
                });

                if (!testExists) {
                    removeParticipation({ id: k });
                }
            }
        });
    }

    function getActiveTests() {
        var now = new Date();
        return TESTS.filter(function (test) {
            var expired = (now - new Date(test.expiry)) > 0;
            if (expired) {
                removeParticipation(test);
                return false;
            }
            return true;
        });
    }

    function getExpiredTests() {
        var now = new Date();
        return TESTS.filter(function (test) {
            return (now - new Date(test.expiry)) > 0;
        });
    }

    function testCanBeRun(test) {
        var expired = (new Date() - new Date(test.expiry)) > 0,
            isSensitive = config.page.shouldHideAdverts;
        return ((isSensitive ? test.showForSensitive : true)
                && test.canRun() && !expired && isTestSwitchedOn(test));
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

    function abData(variantName, complete) {
        return {
            'variantName': variantName,
            'complete': complete
        };
    }

    function getAbLoggableObject() {
        try {
            var log = {};

            getActiveTests()
                .filter(isParticipating)
                .filter(testCanBeRun)
                .forEach(function (test) {
                    var variant = getTestVariantId(test.id);

                    if (variant && variant !== 'notintest') {
                        log[test.id] = abData(variant, 'false');
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
            } else if (variantId === 'notintest' && test.notInTest) {
                test.notInTest();
            }
        }
    }

    /**
     * Determine whether the user is in the test or not and return the associated
     * variant ID.
     *
     * The test population is just a subset of mvt ids. A test population must
     * begin from a specific value. Overlapping test ranges are permitted.
     *
     * @return {String} variant ID
     */
    var variantIdFor = memoize(function(test) {
        var smallestTestId = mvtCookie.getMvtNumValues() * test.audienceOffset;
        var largestTestId = smallestTestId + mvtCookie.getMvtNumValues() * test.audience;
        var mvtCookieId = mvtCookie.getMvtValue();

        if (mvtCookieId && mvtCookieId > smallestTestId && mvtCookieId <= largestTestId) {
            // This mvt test id is in the test range, so allocate it to a test variant.
            var variantIds = test.variants.map(getId);

            return variantIds[mvtCookieId % variantIds.length];
        } else {
            return 'notintest';
        }
    }, getId); // use test ids as memo cache keys

    function allocateUserToTest(test) {
        // Only allocate the user if the test is valid and they're not already participating.
        if (testCanBeRun(test) && !isParticipating(test)) {
             addParticipation(test, variantIdFor(test));
        }
    }

    /**
     * Set up the completion listener for a test
     */
    function registerCompleteEvent(test) {
        var variantId = variantIdFor(test);

        if (variantId !== 'notintest') {
            var variant = getVariant(test, variantId);
            var onTestComplete = variant.success || noop;

            onTestComplete(recordTestComplete(test, variantId));
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
        var index = test.variants.map(getId).indexOf(variantId);
        return index === -1 ? null : test.variants[index];
    }

    // These kinds of tests are both server and client side.
    function getServerSideTests() {
        return Object.keys(config.tests).filter(function (test) { return !!config.tests[test]; });
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
                });
            } else {
                ab.segment();
            }

            cleanParticipations();
        },

        run: function () {
            getActiveTests().forEach(run);
        },

        registerCompleteEvents: function() {
            getActiveTests().forEach(registerCompleteEvent);
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
            variantIdFor.cache = {};
        }
    };

    return ab;

});
