define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/paragraph-spacing'
], function (
    common,
    store,
    ParagraphSpacing) {

    var TESTS = {
        ParagraphSpacing: new ParagraphSpacing()
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

    function getParticipation() {
        var tests = (store.get(participationKey)) ? store.get(participationKey).tests : [];
        // handle previous bug when tests was set to length
        if (typeof tests === "number") {
            tests = [];
        }
        return tests;
    }

    function setParticipation(testName) {
        var participatedTests = getParticipation();

        if (participatedTests.indexOf(testName) === -1) {
            participatedTests.push(testName);
        }

        store.set(participationKey, { "tests": participatedTests });
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

    function init(config, context, options) {
        var hash = window.location.hash.substring(1),
            opts = options || {},
            switches = config.switches;

        if (hash.indexOf('ab-test') === 0 || opts.test) {
            var testConfig = hash.replace('ab-test', '').split('='),
                id = (opts.test) ? opts.test.id : testConfig[0],
                variant = (opts.test) ? opts.test.variant : testConfig[1];
            storeTest(id, variant);
        }

        // Clear up legacy storage names. This can be deleted "in the future".
        store.clearByPrefix('gu.prefs.ab');

        //Is the user in an active test?
        if (inTest(switches)) {
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

               //Can the test run on this page and is switch on
               if(test.canRun(config) && switches["ab" + test.id]) {
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
        setParticipation: setParticipation
    };
});
