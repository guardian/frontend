define([
    'raven',
    'lodash/collections/filter',
    'lodash/collections/forEach',
    'lodash/collections/map',
    'lodash/collections/some',
    'lodash/objects/assign',
    'lodash/objects/keys',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/tests/high-commercial-component',
    'common/modules/experiments/tests/history-tags',
    'common/modules/experiments/tests/breaking-news-alert-style'
], function (
    raven,
    filter,
    forEach,
    map,
    some,
    assign,
    keys,
    _,
    config,
    mediator,
    store,
    mvtCookie,
    HighCommercialComponent,
    HistoryTags,
    BreakingNewsAlertStyle
) {

    var ab,
        TESTS = [
            new HighCommercialComponent(),
            new HistoryTags(),
            new BreakingNewsAlertStyle()
        ],
        participationsKey = 'gu.ab.participations';

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
        var expired = (new Date() - new Date(test.expiry)) > 0;
        return (test.canRun() && !expired && isTestSwitchedOn(test));
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

        return tag.join(',');
    }

    // Finds variant in specific tests and runs it
    function run(test) {
        if (isParticipating(test) && testCanBeRun(test)) {
            var participations = getParticipations(),
                variantId = participations[test.id].variant;
            some(test.variants, function (variant) {
                if (variant.id === variantId) {
                    variant.test();
                    return true;
                }
            });
            if (variantId === 'notintest' && test.notInTest) {
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

        if (smallestTestId <= mvtCookieId && largestTestId > mvtCookieId) {
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

    function getTestVariant(testId) {
        var participation = getParticipations()[testId];
        return participation && participation.variant;
    }

    ab = {

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
            _(getActiveTests())
                .filter(function (test) {
                    return (test.id === testId);
                })
                .forEach(function (test) {
                    addParticipation(test, variant);
                })
                .valueOf();
        },

        segmentUser: function () {
            mvtCookie.generateMvtCookie();

            var tokens, test, variant,
                forceUserIntoTest = /^#ab/.test(window.location.hash);
            if (forceUserIntoTest) {
                tokens = window.location.hash.replace('#ab-', '').split('=');
                test = tokens[0];
                variant = tokens[1];
                ab.forceSegment(test, variant);
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
            return eventTag && _(getActiveTests())
                .filter(function (test) {
                    var testEvents = test.events;
                    return testEvents && some(testEvents, function (testEvent) {
                        return startsWith(eventTag, testEvent);
                    });
                })
                .map(function (test) {
                    return test.id;
                })
                .valueOf();
        },

        getAbLoggableObject: function () {
            var abLogObject = {};

            try {
                forEach(getActiveTests(), function (test) {

                    if (isParticipating(test) && testCanBeRun(test)) {
                        var variant = getTestVariant(test.id);
                        if (variant && variant !== 'notintest') {
                            abLogObject['ab' + test.id] = variant;
                        }
                    }
                });
            } catch (error) {
                // Encountering an error should invalidate the logging process.
                abLogObject = {};
                raven.captureException(error);
            }

            return abLogObject;
        },

        getParticipations: getParticipations,
        makeOmnitureTag: makeOmnitureTag,
        getExpiredTests: getExpiredTests,
        getActiveTests: getActiveTests,
        getTestVariant: getTestVariant,

        // testing
        reset: function () {
            TESTS = [];
        }
    };

    return ab;

});
