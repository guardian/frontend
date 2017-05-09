define([
    'bonzo',
    'lib/$',
    'lib/steady-page',
    'helpers/fixtures',
    'helpers/injector',
    'lib/fastdom-promise'
], function (
    bonzo,
    $,
    steadyPage,
    fixtures,
    Injector,
    fastdom
) {

    describe('Steady Page Utility', function () {
        var $container;
        var $style;
        var injector = new Injector();
        var config;
        var fixturesConfig =  {
            id: 'steady-body'
        };
        var fixtureSingleContainer = [
            '<div class="before"></div>',
            '<div class="js-steady-container steady-container"></div>',
            '<div class="after"></div>'
        ];
        var fixtureMultiContainer = [
            '<div class="before"></div>',
            '<div class="js-steady-container-1 steady-container"></div>',
            '<div class="js-steady-container-2 steady-container"></div>',
            '<div class="js-steady-container-3 steady-container"></div>',
            '<div class="after"></div>'
        ];
        var insertedElHeight = 100;
        var callbackFunc = function (className, container) {
            return function () {
                var insertedEl = $.create('<div class="' + className + '" style="height: ' + insertedElHeight +'px;"></div>');
                container.append(insertedEl);
            };
        };

        // Setup

        beforeEach(function (done) {
            $style = $.create('<style type="text/css"></style>')
                .html('.before{ height: 1000px } ' +
                    '.after { height: 1000px } ' +
                    '.steady-container { margin: 10px 0; }')
                .appendTo('head');

            // We can't scroll the Phantom window for some reason, so
            // we mock window instead
            sinon.spy(window, 'scrollTo');

            injector.require([
                'lib/config'
            ], function (injConfig) {
                config = injConfig;
                config.switches.steadyPageUtil = true;
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            $style.remove();
            window.scrollY = 0;
            window.scrollTo.restore();
        });

        // Tests

        it('should exist', function () {
            // Steady page should be defined
            expect(steadyPage).toBeDefined();
        });

        it('should call scrollTo with the height of the one inserted element', function (done) {
            fixturesConfig.fixtures = fixtureSingleContainer;

            fixtures.render(fixturesConfig);
            $container = $('.js-steady-container');

            var prevScrollPos = 1000;
            window.scrollY = prevScrollPos;

            steadyPage.insert($container[0], callbackFunc('js-inserted-container', $container)).then(function() {
                // scrollTo should be called with the scroll position and the inserted element
                expect(window.scrollTo).toHaveBeenCalledWith(0, prevScrollPos + insertedElHeight);

                // the container should be inserted
                expect(document.getElementsByClassName('js-inserted-container').length).toBeTruthy();
                done();
            });

        });

        it('should call scrollTo with the height of the three inserted elements', function (done) {
            fixturesConfig.fixtures = fixtureMultiContainer;

            fixtures.render(fixturesConfig);
            var containers = [
                {
                    container: $('.js-steady-container-1'),
                    className: 'js-inserted-container-a'
                },
                {
                    container: $('.js-steady-container-2'),
                    className: 'js-inserted-container-b'
                },
                {
                    container: $('.js-steady-container-3'),
                    className: 'js-inserted-container-c'
                }
            ];

            var prevScrollPos = 1000;
            window.scrollY = prevScrollPos;

            Promise.all(containers.map(function(containerObj){
                return steadyPage.insert(containerObj.container[0], callbackFunc(containerObj.className, containerObj.container));
            })).then(function() {
                // All the elements should be inserted
                expect(
                    containers.reduce(function(prevBool, containerObj){
                        return prevBool && document.getElementsByClassName(containerObj.className).length;
                    }, true)
                ).toBeTruthy();

                // We should have called scrollTo with the previous scroll position and 3 times the container height
                expect(window.scrollTo).toHaveBeenCalledWith(0, prevScrollPos + insertedElHeight * 3);
                done();
            });

        });

        it('should call scrollTo with the height of the two inserted element when the second insertion is called after the initial fastdom read', function (done) {

                fixturesConfig.fixtures = fixtureMultiContainer;

                fixtures.render(fixturesConfig);
                var cont1 = $('.js-steady-container-1');
                var cont2 = $('.js-steady-container-2');

                var prevScrollPos = 1000;
                window.scrollY = prevScrollPos;

                var firstInsert = steadyPage.insert(cont1[0], callbackFunc('js-inserted-container-a', cont1));
                // To test the recursion in go we push the insertion to the fastdom.write queue
                var secondInsert = fastdom.write(function(){
                    steadyPage.insert(cont2[0], callbackFunc('js-inserted-container-b', cont2));
                });


                Promise.all([firstInsert, secondInsert]).then(function() {
                    // We don't expect scrollTo to have been called with the height of one container
                    expect(window.scrollTo).not.toHaveBeenCalledWith(0, prevScrollPos + insertedElHeight);
                    // We should have called scrollTo with the previous scroll position and 2 times the container height
                    expect(window.scrollTo).toHaveBeenCalledWith(0, prevScrollPos + insertedElHeight * 2);
                    done();
                });
        });

        it('shouldn\'t call scrollTo if the insertion is below current scroll position', function (done) {
            fixturesConfig.fixtures = fixtureSingleContainer;

            fixtures.render(fixturesConfig);
            $container = $('.js-steady-container');

            steadyPage.insert($container[0], callbackFunc('js-inserted-container', $container)).then(function() {
                // We shouldn't call scrollTo if the element was below the current scroll position
                expect(window.scrollTo).not.toHaveBeenCalled();

                // The element should be inserted
                expect(document.getElementsByClassName('js-inserted-container').length).toBeTruthy();
                done();
            });
        });

        it('should get the height of all the containers', function (done) {
            fixturesConfig.fixtures = fixtureMultiContainer;
            fixtures.render(fixturesConfig);
            var $customStyle = $.create('<style type="text/css"></style>')
                    .html('.steady-container{ height: 300px }')
                    .appendTo('head');

            var currContainers = ['.js-steady-container-1', '.js-steady-container-2', '.js-steady-container-3'];

            // getHeightOfAllContainers expects an array of objects with container
            // as the key for the value of a dom object
            var currContainerFormatted = currContainers.map(function(currContainer) {
                    return { container: document.querySelectorAll(currContainer)[0] };
                });

            // Set scrollY so container heights will all be read
            window.scrollY = 2000;

            var getHeightPromise = steadyPage._tests.getHeightOfAllContainers(currContainerFormatted);

            getHeightPromise.then(function(totalHeight){
                // The total height of the rendered elements should be returned
                expect(totalHeight).toBe(960);

                $customStyle.remove();
                done();
            });
        });

        it('should call the callbacks in the passed array of objects', function (done) {
            var cb1 = sinon.spy();
            var cb2 = sinon.spy();
            var cb3 = sinon.spy();
            var cb4 = sinon.spy();

            // insertElements expects an array of objects with cb
            // as the key for the value of a function to be called
            var currCallbackFormatted =  [cb1, cb2, cb3].map(function(currCallback) {
                return { cb: currCallback };
            });

            var insertElsPromise = steadyPage._tests.insertElements(currCallbackFormatted);
            insertElsPromise.then(function(){
                // All the passed callbacks should have been called
                expect(cb1).toHaveBeenCalled();
                expect(cb2).toHaveBeenCalled();
                expect(cb3).toHaveBeenCalled();

                // The non-passed callback should not have been called
                expect(cb4).not.toHaveBeenCalled();

                done();
            });
        });

        it('should call the callback without modifying any scroll positions if steadyPageUtil switch is false', function (done) {
            fixturesConfig.fixtures = fixtureSingleContainer;

            fixtures.render(fixturesConfig);
            $container = $('.js-steady-container');

            window.scrollY = 1000;

            config.switches.steadyPageUtil = false;

            steadyPage.insert($container[0], callbackFunc('js-inserted-container', $container)).then(function() {
                // scrollTo should be called with the scroll position and the inserted element
                expect(window.scrollTo).not.toHaveBeenCalled();

                // the container should be inserted
                expect(document.getElementsByClassName('js-inserted-container').length).toBeTruthy();
                done();
            });
        });




    });
});
