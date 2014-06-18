define([
    'common/common',
    'common/utils/storage',
    'common/utils/mediator',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/tests/hide-supporting-links',
    'common/modules/experiments/tests/across-the-guardian',
    'common/modules/experiments/tests/display-socially-referred-burners',
    'common/modules/experiments/tests/sentry',
    'common/modules/experiments/tests/larger-mobile-mpu'
], function (
    common,
    store,
    mediator,
    mvtCookie,
    ABHideSupportingLinks,
    ABAcrossTheGuardian,
    ABSociallyReferredContent,
    ABSentry,
    ABLargerMobileMpu
    ) {

    var TESTS = [
            new ABHideSupportingLinks(),
            new ABAcrossTheGuardian(),
            new ABSociallyReferredContent(),
            new ABSentry(),
            new ABLargerMobileMpu()
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

    function cleanParticipations(config) {
        // Removes any tests from localstorage that have been
        // renamed/deleted from the backend
        var participations = getParticipations();
        Object.keys(participations).forEach(function (k) {
            if (typeof(config.switches['ab' + k]) === 'undefined') {
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
        return TESTS.filter(function(test) {
            var expired = (new Date() - new Date(test.expiry)) > 0;
            if (expired) {
                removeParticipation(test);
                return false;
            }
            return true;
        });
    }

    function getExpiredTests() {
        return TESTS.filter(function(test) {
            return (new Date() - new Date(test.expiry)) > 0;
        });
    }

    function testCanBeRun(test, config) {
        var expired = (new Date() - new Date(test.expiry)) > 0;
        return (test.canRun(config) && !expired && isTestSwitchedOn(test, config));
    }

    function getTest(id) {
        var test = TESTS.filter(function (test) {
            return (test.id === id);
        });
        return (test) ? test[0] : '';
    }

    function makeOmnitureTag (config) {
        var participations = getParticipations(),
            tag = [];

        Object.keys(participations).forEach(function (k) {
            if (testCanBeRun(getTest(k), config)) {
                tag.push(['AB', k, participations[k].variant].join(' | '));
            }
        });

        return tag.join(',');
    }

    // Finds variant in specific tests and runs it
    function run(test, config, context) {
        if (isParticipating(test) && testCanBeRun(test, config)) {
            var participations = getParticipations(),
                variantId = participations[test.id].variant;
            test.variants.some(function(variant) {
                if (variant.id === variantId) {
                    variant.test(context, config);
                    return true;
                }
            });
            if (variantId === 'notintest' && test.notInTest) {
                test.notInTest();
            }
        }
    }

    function allocateUserToTest(test, config) {

        // Skip allocation if the user is already participating, or the test is invalid.
        if (!testCanBeRun(test, config) || isParticipating(test)) {
            return;
        }

        // Determine whether the user is in the test or not. The test population is just a subset of mvt ids.
        // A test population must begin from a specific value. Overlapping test ranges are permitted.
        var smallestTestId = mvtCookie.getMvtNumValues() * test.audienceOffset;
        var largestTestId  = smallestTestId + mvtCookie.getMvtNumValues() * test.audience;

        // Get this browser's mvt test id.
        var mvtCookieId = mvtCookie.getMvtValue();

        if (smallestTestId <= mvtCookieId && largestTestId > mvtCookieId) {
            // This mvt test id is in the test range, so allocate it to a test variant.
            var variantIds = test.variants.map(function(variant) {
                return variant.id;
            });
            var testVariantId = mvtCookieId % variantIds.length;

            addParticipation(test, variantIds[testVariantId]);

        } else {
            addParticipation(test, 'notintest');
        }
    }

    function isTestSwitchedOn(test, config) {
        return config.switches['ab' + test.id];
    }

    function getTestVariant(testId) {
        var participation = getParticipations()[testId];
        return participation && participation.variant;
    }

    var ab = {

        addTest: function(test) {
            TESTS.push(test);
        },

        clearTests: function() {
            TESTS = [];
        },

        segment: function(config) {
            getActiveTests().forEach(function(test) {
                allocateUserToTest(test, config);
            });
        },

        forceSegment: function(testId, variant) {
            getActiveTests().filter(function (test) {
                return (test.id === testId);
            }).forEach(function (test) {
                addParticipation(test, variant);
            });
        },

        segmentUser: function(config) {
            mvtCookie.generateMvtCookie();

            var forceUserIntoTest = /^#ab/.test(window.location.hash);
            if (forceUserIntoTest) {
                var tokens = window.location.hash.replace('#ab-','').split('=');
                var test = tokens[0], variant = tokens[1];
                ab.forceSegment(test, variant);
            } else {
                ab.segment(config);
            }

            cleanParticipations(config);
        },

        run: function(config, context) {
            getActiveTests().forEach(function(test) {
                run(test, config, context);
            });
        },

        isEventApplicableToAnActiveTest: function (event) {
            var participations = Object.keys(getParticipations());
            return participations.some(function (id) {
                var listOfEventStrings = getTest(id).events;
                return listOfEventStrings.some(function (ev) {
                    return event.indexOf(ev) === 0;
                });
            });
        },

        getActiveTestsEventIsApplicableTo: function (event) {

            function startsWith(string, prefix) {
                return string.indexOf(prefix) === 0;
            }

            var eventTag = event.tag;
            return eventTag && getActiveTests().filter(function (test) {
                var testEvents = test.events;
                return testEvents && testEvents.some(function (testEvent) {
                    return startsWith(eventTag, testEvent);
                });
            }).map(function (test) {
                return test.id;
            });
        },

        getAbLoggableObject: function(config) {
            var abLogObject = {};

            try {
                getActiveTests().forEach(function (test) {

                    if (isParticipating(test) && testCanBeRun(test, config)) {
                        var variant = getTestVariant(test.id);
                        if (variant && variant !== 'notintest') {
                            abLogObject['ab' + test.id] = variant;
                        }
                    }
                });
            } catch (error) {
                // Encountering an error should invalidate the logging process.
                abLogObject = {};

                mediator.emit('module:error', error, 'common/modules/experiments/ab.js', 267);
            }

            return abLogObject;
        },

        getParticipations: getParticipations,
        makeOmnitureTag: makeOmnitureTag,
        getExpiredTests: getExpiredTests,
        getActiveTests: getActiveTests,
        getTestVariant: getTestVariant
    };

    return ab;

});
