define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/paragraph-spacing',
    'modules/experiments/tests/aa'
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

    //Finds variant in specific tests and exec's
    function run(test, config, context) {
        var expired = (new Date() - new Date(test.expiry)) > 0;
        if (test.canRun(config, context) && !expired && config.switches['ab' + test.id]) {
        
            // if user not in test, bucket them
            if (!isParticipating(test)) {
                bucket(test);
            }
            
            return;
        }
    }

    function bucket(test) {
        // always at least place in control
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

            TESTS.filter(function(test) {
                var expired = (new Date() - new Date(test.expiry)) > 0;
                if (expired) {
                    removeParticipation(test);
                    return false;
                }
                return true;
            }).forEach(function(test) {
                run(test, config, context);
            });
        }

    };

    return ab;

});
