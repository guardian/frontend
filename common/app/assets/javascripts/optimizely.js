var loadOptimizely = function() {
    require(['http://cdn.optimizely.com/js/' + guardian.page.optimizelyId + '.js'], function(optimizely){});
}

require([guardian.js.modules["$g"]], function($g){
    $g.onReady(loadOptimizely);
});