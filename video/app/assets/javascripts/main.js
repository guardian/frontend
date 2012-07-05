// High priority modules
require([guardian.js.modules.detect, guardian.js.modules.topNav],
    function(detect, topNav) {

    }
);

require([guardian.js.modules.commonPlugins], function(common){});

// lower priority modules
require([guardian.js.modules.expanderBinder],
    function(expanderBinder){
        expanderBinder.init();
    }
);
