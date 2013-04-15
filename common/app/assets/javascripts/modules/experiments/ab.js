define([
    'common',
    'modules/userPrefs',

    //Current tests
    'modules/experiments/tests/relatedContent'
], function (
    common,
    userPrefs,
    RelatedContent) {
    
    var TESTS = {
            "relatedContent" : new RelatedContent()
        };

    var key = 'ab';

    function storeTest(test, variant) {
        var data = {id: test, variant: variant};
        userPrefs.set(key + ".current", JSON.stringify(data));
    }

    function getTest() {
        return (userPrefs.get(key)) ? JSON.parse(userPrefs.get(key)) : false;
    }

    // Checks if:
    // local storage is set, is an active test & switch is on
    function inTest(switches) {
        var test = getTest();
        return (test && TESTS[test.id]) ? true : false;
    }

    function clearTest() {
        return userPrefs.remove(key);
    }

    function logParticipation(testName) {
        var k = key + '.participation',
            data = userPrefs.get(key);

        userPrefs.set(key + ".current", JSON.stringify(data));
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

        logParticipation(test.id);
    }

    function init(config) {
        var switches = config.switches,
            isInTest = inTest(switches);

        //Is the user in an active test?
        if(isInTest) {
            var currentTest = getTest();
            runVariant(TESTS[currentTest.id], currentTest.variant);
        } else {
            //First clear out any old test data
            clearTest();

            //Loop over active tests
            for(var test in TESTS) {

               //If previous iteration worked break;
               if(inTest(switches)) { break; }

               //Can the test run on this page
               if(TESTS[test].canRun(config)) {
                   //Start
                   start(TESTS[test]);
               }
            }
        }
        common.mediator.emit('ab:loaded');
    }

    return {
        init: init,
        inTest : inTest,
        getTest : getTest
    };
});
