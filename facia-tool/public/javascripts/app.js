/* global curl: true */
curl([
    'models/list-manager'
]).then(function(
    ListManager
){
    new ListManager().init();
});
