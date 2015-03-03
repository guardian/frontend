define([
    'underscore',
    'test-config',
    'modules/bootstrap',
    'models/config/main',
    'views/config.scala.html!text'
], function (
    _,
    testConfig,
    Bootstrap,
    ConfigEditor,
    templateConfig
) {
    return function () {
        var deferred = $.Deferred();

        document.body.innerHTML += templateConfig
            .replace('@{priority}', 'test')
            .replace('@urlBase(env)', '/')
            .replace(/\@[^\n]+\n/g, '');

        // Mock the time
        var originalSetTimeout = window.setTimeout;
        jasmine.clock().install();
        new ConfigEditor().init(new Bootstrap(), testConfig);

        // Wait for knockout to handle bindings
        originalSetTimeout(function () {
            deferred.resolve();
        }, 50);

        function unload () {
            jasmine.clock().uninstall();
            var container = document.querySelector('.toolbar').parentNode;
            document.body.removeChild(container);
        }

        return {
            loader: deferred.promise(),
            unload: unload
        };
    };
});
