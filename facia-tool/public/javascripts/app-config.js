/* global curl: true */
curl([
    'models/config/main'
]).then(function(
    ConfigEditor
){
    if ('localStorage' in window) {
        new ConfigEditor().init();
    } else {
        window.alert('Sorry, this browser is not supported');
    }
});
