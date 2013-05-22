define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/story-article-swap'
], function (
    common,
    store,
    StoryArticleSwap) {
    
    var TESTS = {
            StoryArticleSwap: new StoryArticleSwap()
        };

    var testKey = 'gu.ab.current',
        participationKey = "gu.ab.participation";

    //For testing purposes
    function addTest(Test) {
        var test = new Test();
        TESTS[test.id] = test;
        return TESTS[test.id];
    }

    function storeTest(test, variant) {
        var data = {id: test, variant: variant};
        store.set(testKey, data);
    }

    function getTest() {
        return (store.get(testKey)) ? store.get(testKey) : false;
    }

    // Checks if:
    // local storage is set, is an active test & switch is on
    function inTest(switches) {
        var test = getTest(),
            switchedOn = switches ? switches["ab" + test.id] : false;

        return (test && TESTS[test.id] && switchedOn) ? true : false;
    }

    function clearTest() {
        return store.remove(testKey);
    }

    function hasParticipated(testName) {
        return (getParticipation().indexOf(testName) > -1) ? true : false;
    }

    function getParticipation() {
        var tests = (store.get(participationKey)) ? store.get(participationKey).tests : [];
        // handle previous bug when tests was set to length
        if (typeof tests === "number") {
            tests = [];
        }
        return tests;
    }

    function setParticipation(testName) {
        var data;
        if(getParticipation().length > 0) {
            var tests = getParticipation();
            if(!hasParticipated(testName)) {
                tests.push(testName);
                data = {"tests": tests };
            } else {
                data = {"tests": tests };
            }
        } else {
            data = {"tests":[testName]};
        }

        store.set(participationKey, data);
    }

    //Finds variant in specific tests and exec's
    function runVariant(test, variant) {
        for(var i= 0, l = test.variants.length;  i < l; i++) {
            if(test.variants[i].id === variant) {
                test.variants[i].test();
                initTracking(test.id, variant);
            }
        }
    }

    function initTracking(id, variant) {
        var data = 'AB | ' + id + ' test | ' + variant;
        common.$g(document.body).attr('data-link-test', data);
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

        setParticipation(test.id);
    }

    function init(config, context) {
        var switches = config.switches,
            isInTest = inTest(switches);

        // Clear up legacy storage names. This can be deleted "in the future".
        store.clearByPrefix('gu.prefs.ab');

        //Is the user in an active test?
        if(isInTest) {
            var currentTest = getTest();
            if(TESTS[currentTest.id].canRun(config, context)) {
                runVariant(TESTS[currentTest.id], currentTest.variant);
            }
        } else {
            //First clear out any old test data
            clearTest();

            //Loop over active tests
            for(var testName in TESTS) {

               //If previous iteration worked break;
               if(inTest(switches)) { break; }

               var test =  TESTS[testName];

               //Can the test run on this page and user not already participated
               if(test.canRun(config) && !hasParticipated(test.id) && switches["ab" + test.id]) {
                   //Start
                   start(test);
               }
            }
        }
    }

    return {
        init: init,
        inTest : inTest,
        addTest: addTest,
        getTest : getTest,
        storeTest: storeTest,
        clearTest: clearTest,
        runVariant : runVariant,
        setParticipation: setParticipation,
        hasParticipated: hasParticipated
    };
});
