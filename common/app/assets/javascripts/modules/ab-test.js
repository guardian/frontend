define([], function () {
    
    var tests = {};
    
    function storeTest(testName, variantName) {
        abTest.cookie = 'frontend-ab-test-' + testName + '=' + variantName + ';path=/;domain=.guardian.co.uk;max-age=600';
        
        return abTest;
    }
    
    function inTest(testName) {
        var testCookie = abTest.cookie.split('; ').filter(function(cookie) {
            return cookie.split('=')[0] = 'frontend-ab-test-' + testName; 
        })[0];
        
        if (testCookie) {
            return testCookie.split('=')[1];
        } else {
            return false;
        }
    }

    var abTest = {
            
        setCookie: document.cookie,
            
        add: function(testName, variants) {
            tests[testName] = variants;
            
            return abTest;
        },
        
        get: function(testName) {
            return tests[testName];
        },
        
        start: function(testName) {
            var test = tests[testName],
                // are we already in the test
                testVariant = inTest(testName);
            
            if (testVariant === false) {
                var variantNames = ['control'];
                for (var variantName in test) {
                    variantNames.push(variantName);
                }
                testVariant = variantNames[Math.floor(Math.random() * variantNames.length)];
                // store test's variant
                storeTest(testName, testVariant);
            }
            
            // run variant (if not control)
            (testVariant === 'control') || test[testVariant]();
            
            return abTest;
        }
            
    };

    return abTest;

});
