define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/paragraph-spacing'
], function (
    common,
    store,
    ParagraphSpacing) {

    var TESTS = [
            new ParagraphSpacing()
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
        var dataLinkTest = common.$g(document.body).attr('data-link-test');
        var data = 'AB | ' + test.id + ' test | ' + variantId;
        common.$g(document.body).attr('data-link-test', data);
    }

    //Finds variant in specific tests and exec's
    function run(test, config, context) {
        if (test.canRun(config, context) && config.switches['ab' + test.id]) {
            // if user not in test, bucket them
            if (!isParticipating(test)) {
                bucket(test);
            }
            var participations = getParticipations(),
                variantId = participations[test.id].variant;
            test.variants.some(function(variant) {
                if (variant.id === variantId) {
                    variant.test();
                    initTracking(test, variantId);
                    return true;
                }
            });
        }
    }

    function bucket(test) {
        // always at least place in control
        var testVariantId = 'control';

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
    }

    var ab = {

        //For testing purposes
        addTest: function(test) {
            TESTS.push(test);
        },

        getParticipations: getParticipations,
        
        clearTests: function() {
            TESTS = [];
        },

        init: function(config, context, options) {
            var hash = window.location.hash.substring(1),
                opts = options || {};

            // allow setting of test with url hash
            if (hash.indexOf('ab-test') === 0 || opts.test) {
                var testConfig = hash.replace('ab-test', '').split('='),
                    testId = (opts.test) ? opts.test.id : testConfig[0],
                    variantId = (opts.test) ? opts.test.variant : testConfig[1];
                // get the test
                TESTS.some(function(test) {
                    if (test.id === testId) {
                        addParticipation(test, variantId);
                        return true;
                    }
                });
            }

            // Clear up legacy storage names. This can be deleted "in the future".
            store.clearByPrefix('gu.prefs.ab');
            store.remove('gu.ab.current');
            store.remove('gu.ab.participation');

            TESTS.forEach(function(test) {
                run(test, config, context);
            });
        }

    };

    return ab;

});
