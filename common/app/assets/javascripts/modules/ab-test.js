define([], function () {
    
    var tests = {};
    
    function storeVariant(name) {
        
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
            var variantNames = ['control'],
                randomVariantName;
            for (var variantName in tests[testName]) {
                variantNames.push(variantName);
            }
            randomVariantName = variantNames[Math.floor(Math.random() * messages.length)];
            // store variant
            storeVariant(randomVariantName);
            // run variant (if not control)
            (randomVariantName === 'control') || variants[randomVariantName]();
            
            return abTest;
        }
            
    };

    return abTest;

});
