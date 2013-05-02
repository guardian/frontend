define([
    'common',
    'modules/userPrefs',

    //Current tests
    'modules/experiments/tests/relatedContent',
    'modules/experiments/tests/local-election-story'
], function (
    common,
    userPrefs,
    RelatedContent,
    LocalElectionStory) {
    
    var TESTS = {
            LocalElectionStory: new LocalElectionStory()
        };

    var testKey = 'ab.current',
        participationKey = "ab.participation";

    //For testing purposes
    function addTest(Test) {
        var test = new Test();
        TESTS[test.id] = test;
        return TESTS[test.id];
    }

    function storeTest(test, variant) {
        var data = {id: test, variant: variant};
        userPrefs.set(testKey, data);
    }

    function getTest() {
        return (userPrefs.get(testKey)) ? userPrefs.get(testKey) : false;
    }

    // Checks if:
    // local storage is set, is an active test & switch is on
    function inTest(switches) {
        var test = getTest(),
            switchedOn = switches["ab" + test.id];

        return (test && TESTS[test.id] && switchedOn) ? true : false;
    }

    function clearTest() {
        return userPrefs.remove(testKey);
    }

    function hasParticipated(testName) {
        return (getParticipation().indexOf(testName) > -1) ? true : false;
    }

    function getParticipation() {
        var tests = (userPrefs.get(participationKey)) ? userPrefs.get(participationKey).tests : [];
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

        userPrefs.set(participationKey, data);
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

    function init(config) {
        var switches = config.switches,
            isInTest = inTest(switches);

        //Is the user in an active test?
        if(isInTest) {
            var currentTest = getTest();
            if(TESTS[currentTest.id].canRun(config)) {
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
               if(test.canRun(config) && !hasParticipated(test.id)) {
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
