/* global curl: true */
curl([
    'models/list-manager'
]).then(function(
    ListManager
){
    if ('localStorage' in window) {
        new ListManager().init();
    } else {
        window.alert('Sorry, this browser is not supported');
    }
});
