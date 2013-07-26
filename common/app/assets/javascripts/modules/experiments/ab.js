define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/paragraph-spacing',
    'modules/experiments/tests/aa',
    'modules/experiments/tests/lightbox-galleries'
], function (
    common,
    store,
    ParagraphSpacing,
    Aa
    ) {

    var TESTS = [
            new ParagraphSpacing(),
            new Aa()
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
        dataLinkTest.push(['AB', test.id + ' test', variantId]. join(' | '));
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
