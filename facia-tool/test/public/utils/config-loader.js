define([
    'underscore',
    'models/config/main',
    'test/fixtures/one-front-config',
    'mock/switches',
    'utils/mediator',
    'views/config.scala.html!text'
], function (
    _,
    ConfigEditor,
    fixConfig,
    mockSwitches,
    mediator,
    templateConfig
) {
    return function () {
        var deferred = $.Deferred();

        // The configuration tool is ready when config and switches are loaded
        var loaded = _.after(2, _.once(function () {
            deferred.resolve();
        }));
        mediator.once('mock:config', loaded);
        mediator.once('mock:switches', loaded);

        document.body.innerHTML += templateConfig
            .replace('@{priority}', 'test')
            .replace('@urlBase(env)', '/')
            .replace(/\@[^\n]+\n/g, '');

        // Mock the time
        jasmine.clock().install();
        new ConfigEditor().init();
        // There's a network request in the init to get the config, advance time
        jasmine.clock().tick(100);

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
