define([
    'common',
    'modules/userPrefs',

    //Current tests
    'modules/experiments/tests/relatedContent'
], function (
    common,
    userPrefs,
    relatedContent) {
    
    var TESTS = {
        "related-content" : relatedContent
    };

    // gu.prefs.ab = {test: 'testId', variant: 'variantName'}
    var key = 'ab';

    //Checks if local storage is set and if test still is active
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

    //Finds variant in specific tests and exec's
    function runVariant(test, variant) {
        for(var i= 0, l = test.variants.length;  i < l; i++) {
            if(test.variants[i].id === variant) {
                test.variants[i].test();
            }
        }
    }
        
    function start(test) {
        //Only run on test required audience segment
        if (Math.random() < test.audience) {
            var variantNames = [];

            //Get all variants in test
            for(var i= 0, l = test.variants.length;  i < l; i++) {
                variantNames.push(test.variants[i].id);
            }

            //Place user in variant pool
            var testVariant = variantNames[Math.floor(Math.random() * variantNames.length)];

            //Run and store
            runVariant(test, testVariant);
            storeTest(test.id, testVariant);
        }

    }

    function init(config) {
        var currentTest = inTest();
        //Is the user in an active test?
        if(currentTest) {
            runVariant(TESTS[currentTest.id], currentTest.variant);
        } else {
            //First clear out any old test data
            clearTest();

            //Loop over active tests
            for(var i = 0, l = TESTS.length; i<l; i++) {
               //If previous iteration worked break;
               if(inTest()) { break; }
               //Can the test run on this page
               if(TESTS[i].canRun) {
                   //Start
                   start(TESTS[i]);
               }
            }
        }
        common.mediator.emit('ab:loaded');
    }

    return {
        init: init
    };
});
