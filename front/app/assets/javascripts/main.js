require([guardian.js.modules.commonPlugins, guardian.js.modules.topNav], function(common){});

//lower priority modules
require([guardian.js.modules.trailExpander],
    function(trailExpander) {
        trailExpander.bindExpanders();
    }
);