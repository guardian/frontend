define([], function () {

    function Interactive(context, config) {
        
        var host = 'http://s3-eu-west-1.amazonaws.com/aws-frontend-interactives',
            path = config.page.pageId;

        this.init = function () {
            require([host, path, 'boot.js'].join('/'), function (interactive) {
                interactive.boot(context, config);
            });
        };

    }

    return Interactive;

});
