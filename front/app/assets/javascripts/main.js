require([guardian.js.modules.commonPlugins], function(common){});

//lower priority modules
require([guardian.js.modules.trailExpander],
    function(trailExpander) {
        trailExpander.bindExpanders();
    }
);