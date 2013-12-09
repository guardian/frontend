curl([
    'models/list-manager'
]).then(function(
    ListManager
){
    new ListManager('.top-stories').init();
});
