/*global guardian:true */
require(['core', 'domReady!'], function(core) {

    try {
        require(['bootstraps/app'], function(app) {
            if (guardian.isModernBrowser) {
                app.go();
            }
        });
    } catch(e) {
    }
});
