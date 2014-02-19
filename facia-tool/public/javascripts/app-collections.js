/* global curl: true */
curl([
    'models/collections/main'
]).then(function(
    CollectionsEditor
){
    if ('localStorage' in window) {
        new CollectionsEditor().init();
    } else {
        window.alert('Sorry, this browser is not supported');
    }
});
