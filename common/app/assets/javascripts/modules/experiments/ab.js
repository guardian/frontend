define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/inline-link-card',
    'modules/experiments/tests/aa',
    'modules/experiments/tests/gallery-style',
    'modules/experiments/tests/gallery-cta',
    'modules/experiments/tests/swipe-ctas',
    'modules/experiments/tests/expandable-mostpopular',
    'modules/experiments/tests/right-hand-card',
    'modules/experiments/tests/most-popular-from-facebook'
], function (
    common,
    store,
    
    ExperimentInlineLinkCard,
    Aa,
    GalleryStyle,
    GalleryCta,
    SwipeCtas,
    ExperimentExpandableMostPopular,
    RightHandCard,
    MostPopularFromFacebook
    ) {

    var TESTS = [
            new ExperimentInlineLinkCard(),
            new Aa(),
            new GalleryStyle(),
            new GalleryCta(),
            new SwipeCtas(),
            new ExperimentExpandableMostPopular(),
            new RightHandCard(),
            new MostPopularFromFacebook()
        ],
        participationsKey = 'gu.ab.participations';

    function getParticipations() {
        return store.get(participationsKey) || {};
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
        store.set(participationsKey, participations);
    }

    function removeParticipation(test) {
        var participations = getParticipations();
        delete participations[test.id];
        store.set(participationsKey, participations);
    }

    function clearParticipations() {
        return store.remove(participationsKey);
    }

    function initTracking(test, variantId) {
        var dataLinkTest = [],
            currentDataLinkTest = common.$g(document.body).attr('data-link-test');
        if (currentDataLinkTest) {
            dataLinkTest.push(currentDataLinkTest);
        }

        var testName = ['AB', test.id + ' test', variantId]. join(' | ');
        if (!currentDataLinkTest || currentDataLinkTest.indexOf(testName) === -1) {
            dataLinkTest.push(testName);
        }

        common.$g(document.body).attr('data-link-test', dataLinkTest.join(', '));
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

    function testCanBeRun (test, config) {
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
        var participations = getParticipations();
        return Object.keys(participations).map(function (k) {
            if (testCanBeRun(getTest(k), config)) {
                return ['AB', k, participations[k].variant].join(' | ');
            }
        }).join(',');
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
                    initTracking(test, variantId);
                    return true;
                }
        });
    }

    function bucket(test, config) {

        // if user not in test, bucket them
        if (isParticipating(test) || !testCanBeRun(test, config)) {
            return false;
        }

        // always at least place in a notintest control
        var testVariantId = 'notintest';

        //Only run on test required audience segment
        if (Math.random() < test.audience) {
            var variantIds = test.variants.map(function(variant) {
                return variant.id;
            });

            //Place user in variant pool
            testVariantId = variantIds[Math.floor(Math.random() * variantIds.length)];
        }

        // store
        addParticipation(test, testVariantId);

        return true;
    }

    var ab = {

        addTest: function(test) {
            TESTS.push(test);
        },

        clearTests: function() {
            TESTS = [];
        },

        segment: function(config, options) {
            var opts = options || {};
            getActiveTests().forEach(function(test) {
                bucket(test, config);
            });
        },

        // mostly for private use
        forceSegment: function (testId, variant) {
            getActiveTests().filter(function (test) {
                return (test.id === testId);
            }).forEach(function (test) {
                addParticipation(test, variant);
            });
        },

        run: function(config, context, options) {
            var opts = options || {};

            getActiveTests().forEach(function(test) {
                run(test, config, context);
            });
        },

        getParticipations: getParticipations,
        makeOmnitureTag: makeOmnitureTag

    };

    return ab;

});
