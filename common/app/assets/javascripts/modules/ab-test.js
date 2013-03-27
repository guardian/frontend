define([], function () {
    
    var tests = {};
    
    function storeTest(testName, variantName) {
        document.cookie = 'frontend-ab-test=' + testName + '_' + variantName + ';path=/;domain=.guardian.co.uk;max-age=600';
    }

    var abTest = {
            
        add: function(testName, variants) {
            tests[testName] = variants;
            
            return abTest;
        },
        
        get: function(testName) {
            return tests[testName];
        },
        
        start: function(testName) {
            // put in random variant
            var test = tests[testName],
                variantNames = ['control'],
                randomVariantName;
            for (var variantName in test) {
                variantNames.push(variantName);
            }
            randomVariantName = variantNames[Math.floor(Math.random() * variantNames.length)];
            // store test's variant
            storeTest(testName, randomVariantName);
            // run variant (if not control)
            (randomVariantName === 'control') || test[randomVariantName]();
            
            return abTest;
        }
            
    };

    return abTest;

});
