define([
    'modules/userPrefs',

    //Current tests
    'modules/experiments/tests/relatedContent'
], function (
    userPrefs,
    relatedContent) {
    
    var TESTS = {
        "related-content" : relatedContent
    };

    // gu.prefs.ab = {test: 'testId', variant: 'variantName'}
    var key = 'ab';

    function inTest() {
        var test = JSON.parse(userPrefs.get(key));
        return (test && TESTS[test.id]) ? test : false;
    }

    function storeTest(test, variant) {
        var data = {test: test, variant: variant};
        userPrefs.set(key, JSON.stringify(data));
    }

    function clearTest() {
        userPrefs.remove(key);
    }

    function runVariant(test, variant) {
        for(var i= 0, l = test.variants.length;  i < l; i++) {
            if(test.variants[i].id === variant) {
                test.variants[i].test();
            }
        }
    }
        
    function start(test) {

        if (Math.random() < test.audience) {
            var variantNames = [];

            for(var i= 0, l = test.variants.length;  i < l; i++) {
                variantNames.push(test.variants[i].id);
            }

            var testVariant = variantNames[Math.floor(Math.random() * variantNames.length)];

            runVariant(test, testVariant);
            storeTest(test.id, testVariant);
        }

    }

    function init(config) {
        var currentTest = inTest();
        if(currentTest) {
            runVariant(TESTS[currentTest.id], currentTest.variant);
        } else {
            clearTest();
            for(var i = 0, l = TESTS.length; i<l; i++) {
               if(inTest()) { break; }
               if(TESTS[i].canRun) {
                   start(TESTS[i]);
               }
            }
        }
    }

    return {
        init: init
    };
});
