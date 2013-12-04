define([
    'common',
    'utils/storage',
    'modules/analytics/mvt-cookie',

    //Current tests
    'modules/experiments/tests/aa',
    'modules/experiments/tests/live-blog-show-more',
    'modules/experiments/tests/alpha-adverts',
    'modules/experiments/tests/commercial-components',
    'modules/experiments/tests/story-package-question',
    'modules/experiments/tests/initial-show-more',
    'modules/experiments/tests/show-more-layout',
    'modules/experiments/tests/mobile-facebook-autosignin',
    'modules/experiments/tests/onward-intrusive'
], function (
    common,
    store,
    mvtCookie,

    Aa,
    LiveBlogShowMore,
    AlphaAdverts,
    CommercialComponentsTest,
    StoryPackageQuestion,
    InitialShowMore,
    ShowMoreLayout,
    MobileFacebookAutosignin,
    OnwardIntrusive
    ) {

    var TESTS = [
            new Aa(),
            new LiveBlogShowMore(),
            new AlphaAdverts(),
            new CommercialComponentsTest(),
            new StoryPackageQuestion(),
            new InitialShowMore(),
            new ShowMoreLayout(),
            new MobileFacebookAutosignin(),
            new OnwardIntrusive()
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

    function clearParticipations() {
        return store.local.remove(participationsKey);
    }

    function cleanParticipations(config) {
        // Removes any tests from localstorage that have been
        // renamed/deleted from the backend
        var participations = getParticipations();
        Object.keys(participations).forEach(function (k) {
            if (typeof(config.switches['ab' + k]) === 'undefined') {
                removeParticipation({ id: k });
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

    function testCanBeRun(test, config) {
        var expired = (new Date() - new Date(test.expiry)) > 0;
        return (test.canRun(config) && !expired && config.switches['ab' + test.id]);
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

        if (!isParticipating(test) || !testCanBeRun(test, config)) {
            return false;
        }

        var participations = getParticipations(),
            variantId = participations[test.id].variant;
            test.variants.some(function(variant) {
                if (variant.id === variantId) {
                    variant.test(context);
                    return true;
                }
        });
    }

    function allocateUserToTest(test, config) {

        // Skip allocation if the user is already participating, or the test is invalid.
        if (isParticipating(test) || !testCanBeRun(test, config)) {
            return;
        }

        // Determine whether the user is in the test or not. The test population is just a subset of mvt ids.
        // A test population must begin from a specific value. Overlapping test ranges are permitted.
        var smallestTestId = mvtCookie.getMvtNumValues() * test.audienceOffset;
        var largestTestId  = smallestTestId + mvtCookie.getMvtNumValues() * test.audience;

        // Get this browser's mvt test id.
        var mvtCookieId = mvtCookie.getMvtValue();

        if (smallestTestId <= mvtCookieId &&
            largestTestId > mvtCookieId) {

            // This mvt test id is in the test range, so allocate it to a test variant.
            var variantIds = test.variants.map(function(variant) {
                return variant.id;
            });
            var testVariantId = mvtCookieId % variantIds.length;

            addParticipation(test, variantIds[testVariantId]);

        } else {
            addParticipation(test, "notintest");
        }
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

        run: function(config, context) {

            var forceUserIntoTest = /^#ab/.test(window.location.hash);
            if (forceUserIntoTest) {
                var tokens = window.location.hash.replace('#ab-','').split('=');
                var test = tokens[0], variant = tokens[1];
                ab.forceSegment(test, variant);
            } else {
                ab.segment(config);
            }

            cleanParticipations(config);

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

        getTestVariant: function(testId) {
            return getParticipations()[testId].variant;
        },

        getParticipations: getParticipations,
        makeOmnitureTag: makeOmnitureTag

    };

    return ab;

});
