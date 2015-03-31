define([
    'raven',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/tests/high-commercial-component',
    'common/modules/experiments/tests/identity-social-oauth',
    'common/modules/experiments/tests/krux-audience-science',
    'common/modules/experiments/tests/mt-master',
    'common/modules/experiments/tests/register-popup',
    'common/modules/experiments/tests/mt-top-below-nav',
    'common/modules/experiments/tests/heatmap',
    'common/modules/experiments/tests/mt-top-below-first-container',
    'common/modules/experiments/tests/mt-sticky-nav',
    'common/modules/experiments/tests/across-the-country',
    'common/modules/experiments/tests/defer-spacefinder',
    'common/modules/experiments/tests/adblock-message'
], function (
    raven,
    _,
    config,
    mediator,
    store,
    mvtCookie,
    HighCommercialComponent,
    IdentitySocialOAuth,
    KruxAudienceScience,
    MtMaster,
    RegisterPopup,
    MtTopBelowNav,
    HeatMap,
    MtTopBelowFirstContainer,
    MtStickyNav,
    AcrossTheCountry,
    DeferSpacefinder,
    AdblockMessage
) {

    var ab,
        TESTS = [
            new HighCommercialComponent(),
            new IdentitySocialOAuth(),
            new KruxAudienceScience(),
            new MtMaster(),
            new RegisterPopup(),
            new MtTopBelowNav(),
            new HeatMap(),
            new MtTopBelowFirstContainer(),
            new MtStickyNav(),
            new AcrossTheCountry(),
            new DeferSpacefinder(),
            new AdblockMessage()
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
        _.forEach(_.keys(participations), function (k) {
            if (typeof (config.switches['ab' + k]) === 'undefined') {
                removeParticipation({ id: k });
            } else {
                var testExists = _.some(TESTS, function (element) {
                    return element.id === k;
                });

                if (!testExists) {
                    removeParticipation({ id: k });
                }
            }
        });
    }

    function getActiveTests() {
        return _.filter(TESTS, function (test) {
            var expired = (new Date() - new Date(test.expiry)) > 0;
            if (expired) {
                removeParticipation(test);
                return false;
            }
            return true;
        });
    }

    function getExpiredTests() {
        return _.filter(TESTS, function (test) {
            return (new Date() - new Date(test.expiry)) > 0;
        });
    }

    function testCanBeRun(test) {
        var expired = (new Date() - new Date(test.expiry)) > 0;
        return (test.canRun() && !expired && isTestSwitchedOn(test));
    }

    function getTest(id) {
        var test = _.filter(TESTS, function (test) {
            return (test.id === id);
        });
        return (test) ? test[0] : '';
    }

    function makeOmnitureTag() {
        var participations = getParticipations(),
            tag = [];

        _.forEach(_.keys(participations), function (k) {
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
            _.some(test.variants, function (variant) {
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
            variantIds = _.map(test.variants, function (variant) {
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

    function setTestVariant(testId, variant) {
        var participations = getParticipations();

        if (participations[testId]) {
            participations[testId].variant = variant;
            store.local.set(participationsKey, participations);
        }
    }

    ab = {

        addTest: function (test) {
            TESTS.push(test);
        },

        clearTests: function () {
            TESTS = [];
        },

        segment: function () {
            _.forEach(getActiveTests(), function (test) {
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
            _.forEach(getActiveTests(), function (test) {
                run(test);
            });
        },

        isEventApplicableToAnActiveTest: function (event) {
            var participations = _.keys(getParticipations());
            return _.some(participations, function (id) {
                var listOfEventStrings = getTest(id).events;
                return _.some(listOfEventStrings, function (ev) {
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
                    return testEvents && _.some(testEvents, function (testEvent) {
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
                _.forEach(getActiveTests(), function (test) {

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
        setTestVariant: setTestVariant,

        /**
         * check if a test can be run (i.e. is not expired and switched on)
         *
         * @param  {string|Object} test   id or test object
         * @return {Boolean}
         */
        testCanBeRun: function (test) {
            if (typeof test === 'string') {
                return testCanBeRun(_.find(TESTS, function (t) {
                    return t.id === test;
                }));
            }

            return test.id && test.expiry && testCanBeRun(test);
        },

        // testing
        reset: function () {
            TESTS = [];
        }
    };

    return ab;

});
