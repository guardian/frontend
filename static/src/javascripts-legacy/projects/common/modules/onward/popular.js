define(
    [
        'qwery',
        'lib/config',
        'common/modules/component',
        'lib/mediator',
        'lodash/collections/contains',
    ],
    function(qwery, config, Component, mediator, contains) {
        function MostPopular() {
            // This is not going to evolve into a random list of sections. If anyone wants more than these 2 then
            // they get to comission the work to have it go through the entire tooling chain so that a section has a
            // property that tells us whether it shows most popular or not.
            // Don't even come ask...
            var sectionsWithoutPopular = ['info', 'global'];
            mediator.emit('register:begin', 'popular-in-section');
            this.hasSection =
                config.page &&
                config.page.section &&
                !contains(sectionsWithoutPopular, config.page.section);
            this.endpoint =
                '/most-read' +
                (this.hasSection ? '/' + config.page.section : '') +
                '.json';
        }

        Component.define(MostPopular);

        MostPopular.prototype.init = function() {
            this.fetch(qwery('.js-popular-trails'), 'html');
        };

        MostPopular.prototype.ready = function() {
            mediator.emit('modules:popular:loaded', this.elem);
            mediator.emit('page:new-content', this.elem);
            mediator.emit('register:end', 'popular-in-section');
        };

        return MostPopular;
    }
);
