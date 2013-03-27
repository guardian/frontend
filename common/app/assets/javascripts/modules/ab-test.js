define([], function () {
    
    var tests = {};

    var abTest = {
            
        add: function(testName, variants) {
            tests[testName] = variants;
            return abTest;
        },
        
        get: function(testName) {
            return tests[testName];
        },
        
        start: function(testName) {
            return abTest;
        }
            
    };

    return abTest;

});
