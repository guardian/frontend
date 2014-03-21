define([
    'modules/ui/container-toggle',
    'common/common',
    'bonzo',
    'bean',
    'common/modules/userPrefs',
    'qwery'
], function(
    ContainerDisplayToggle,
    common,
    bonzo,
    bean,
    userPrefs,
    qwery
) {

    describe('Container Toggle', function() {

        var container,
            $container,
            containerId = 'uk/culture/regular-stories',
            storageId = 'container-states',
            // helper assertion method
            assertState = function($container, state) {
                var $button = common.$g('button', $container[0]);
                expect($container.hasClass('container--rolled-up'))[state === 'open' ? 'toBeFalsy' : 'toBeTruthy']();
                expect($button.text()).toBe(state === 'open' ? 'Hide' : 'Show');
                expect($button.attr('data-link-name')).toBe(state === 'open' ? 'Show' : 'Hide');
            };

        beforeEach(function(){
            container = bonzo.create(
                '<section class="container js-container--toggle" data-id="' + containerId + '">' +
                    '<h2 class="container__title">A container</h2>' +
                '</section>'
            )[0];
            $container = bonzo(container);
        });

        afterEach(function(){
            window.localStorage.clear();
        });

        it('should be able to initialise', function() {
            var containerDisplayToggle = new ContainerDisplayToggle(container);
            expect(containerDisplayToggle).toBeDefined();
        });

        it('should remove "js-container--toggle" class from container', function() {
            new ContainerDisplayToggle(container).addToggle();
            expect($container.hasClass('js-container--toggle')).toBeFalsy();
        });

        it('should delete old storage key', function() {
            var oldStorageKey = 'gu.prefs.front-trailblocks';
            window.localStorage.setItem(oldStorageKey, 'foo');
            new ContainerDisplayToggle(container);
            expect(window.localStorage.getItem(oldStorageKey)).toBeNull();
        });

        it('should add button to the container\'s title', function() {
            new ContainerDisplayToggle(container).addToggle();
            expect(qwery('.container__title .container__toggle', container).length).toBe(1);
        });

        it('initial state should be open', function() {
            new ContainerDisplayToggle(container).addToggle();
            assertState($container, 'open');
        });

        it('should be able to close container', function() {
            new ContainerDisplayToggle(container).addToggle();
            // click button
            bean.fire(common.$g('button', container)[0], 'click');
            assertState($container, 'closed');
        });

        it('should store state as user preference', function() {
            new ContainerDisplayToggle(container).addToggle();
            var button = common.$g('button', container)[0];
            // click button
            bean.fire(button, 'click');
            var expectedValue = {};
            expectedValue[containerId] = 'closed';
            expect(userPrefs.get(storageId)).toEqual(expectedValue);
            // now close container
            bean.fire(button, 'click');
            expect(userPrefs.get(storageId)).toEqual({});
        });

        it('initial state should be based on user preference', function() {
            var prefs = {};
            prefs[containerId] = 'closed';
            userPrefs.set(storageId, prefs);
            new ContainerDisplayToggle(container).addToggle();
            assertState($container, 'closed');
        });

    });

});
