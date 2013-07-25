curl(['modules/fronts/listManager']).then(function(ListManager) {

    new ListManager('.top-stories').init();

});
