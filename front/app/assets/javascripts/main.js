require([guardian.js.modules.expanderBinder],
    function(expanderBinder){
        expanderBinder.init();
    }
);


require([
    guardian.js.modules.commonPlugins, 
    guardian.js.modules.topNav], function(common, topNav){
});

