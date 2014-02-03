/* global curl: true */
curl([
    'models/main-config'
]).then(function(
    ConfigEditor
){
    if ('localStorage' in window) {
        new ConfigEditor().init();
    } else {
        window.alert('Sorry, this browser is not supported');
    }
});
