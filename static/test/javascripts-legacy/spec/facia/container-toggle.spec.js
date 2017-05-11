define([
    'lib/$',
    'bonzo',
    'fastdom',
    'common/modules/user-prefs',
    'helpers/injector'
], function (
    $,
    bonzo,
    fastdom,
    userPrefs,
    Injector
) {
    describe('Container Toggle', function () {
        var container;
        var $container;
        var mediator;
        var ContainerDisplayToggle;
        var injector = new Injector();
        var containerId = 'uk/culture/regular-stories';
        var storageId = 'container-states';
        // helper assertion method
        var assertState = function ($cont, state) {
            var $button = $('button', $cont[0]);

            expect($cont.hasClass('fc-container--rolled-up'))[state === 'open' ? 'toBeFalsy' : 'toBeTruthy']();
            expect($button.text().trim()).toBe(state === 'open' ? 'Hide' : 'Show');
            expect($button.attr('data-link-name')).toBe(state === 'open' ? 'Show' : 'Hide');
        };

        function simulateClick() {
            mediator.emit('module:clickstream:click', {
                target: $('button', container)[0]
            });
        }

        beforeEach(function (done) {
            container = bonzo.create(
                '<section class="fc-container js-container--toggle" data-id="' + containerId + '">' +
                '<div class="fc-container__header js-container__header">' +
                '<h2>A container</h2>' +
                '</div>' +
                '</section>'
            )[0];
            $container = bonzo(container);
            injector.mock('common/views/svgs', {
                inlineSvg: function() {
                    return '';
                }
            });
            injector.require([
                'facia/modules/ui/container-toggle',
                'lib/mediator'
            ], function(containerDisplayToggleModule, mediatorModule) {
                ContainerDisplayToggle = containerDisplayToggleModule;
                mediator = mediatorModule;
                done();
            });
        });

        afterEach(function () {
            window.localStorage.clear();
            $container.remove();
        });

        it('should be able to initialise', function () {
            var containerDisplayToggle = new ContainerDisplayToggle(container);
            expect(containerDisplayToggle).toBeDefined();
        });

        it('should remove "js-container--toggle" class from container', function (done) {
            new ContainerDisplayToggle(container).addToggle();

            fastdom.defer(1, function () {
                expect($container.hasClass('js-container--toggle')).toBeFalsy();
                done();
            });
        });

        it('should add "container--has-toggle" class to container', function (done) {
            new ContainerDisplayToggle(container).addToggle();

            fastdom.defer(1, function () {
                expect($container.hasClass('fc-container--has-toggle')).toBeTruthy();
                done();
            });
        });

        it('should delete old storage key', function () {
            var oldStorageKey = 'gu.prefs.front-trailblocks';
            window.localStorage.setItem(oldStorageKey, 'foo');
            /*eslint-disable no-new*/
            new ContainerDisplayToggle(container);
            /*eslint-enable no-new*/
            expect(window.localStorage.getItem(oldStorageKey)).toBeNull();
        });

        it('should add button to the container\'s header', function (done) {
            new ContainerDisplayToggle(container).addToggle();

            fastdom.defer(1, function () {
                expect($('.js-container__header .fc-container__toggle', container).length).toBe(1);
                done();
            });
        });

        it('initial state should be open', function (done) {
            new ContainerDisplayToggle(container).addToggle();

            fastdom.defer(1, function () {
                assertState($container, 'open');
                done();
            });
        });

        it('should be able to close container', function (done) {
            new ContainerDisplayToggle(container).addToggle();

            fastdom.defer(1, function () {
                simulateClick();

                fastdom.defer(1, function () {
                    assertState($container, 'closed');
                    done();
                });
            });
        });

        it('should store state as user preference', function (done) {
            new ContainerDisplayToggle(container).addToggle();
            // click button

            fastdom.defer(1, function () {
                simulateClick();

                var expectedValue = {};
                expectedValue[containerId] = 'closed';

                fastdom.defer(1, function () {
                    expect(userPrefs.get(storageId)).toEqual(expectedValue);

                    // now close container
                    simulateClick();

                    fastdom.defer(1, function () {
                        expect(userPrefs.get(storageId)).toEqual({});

                        done();
                    });
                });
            });
        });

        it('initial state should be based on user preference', function (done) {
            var prefs = {};
            prefs[containerId] = 'closed';
            userPrefs.set(storageId, prefs);
            new ContainerDisplayToggle(container).addToggle();

            fastdom.defer(1, function () {
                assertState($container, 'closed');
                done();
            });
        });
    });
});
