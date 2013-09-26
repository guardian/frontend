curl([
    'modules/listManager'
]).then(function(
    ListManager
){
    new ListManager('.top-stories').init();
});
