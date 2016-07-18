define([
    'bonzo',
    'common/utils/$',
    'common/utils/steady-page',
    'helpers/fixtures'
], function (
    bonzo,
    $,
    steadyPage,
    fixtures
) {
    fdescribe('Steady Page Utility', function () {
        var $container;
        var $style;
        var callbackFunc;
        var fixturesConfig =  {
            id: 'steady-body',
            fixtures: [
                '<div class="before"></div>',
                '<div class="js-steady-container steady-container"></div>',
                '<div class="after"></div>'
            ]
        }

        beforeEach(function (done) {
            fixtures.render(fixturesConfig);

            $container = $('.js-steady-container');

            $style = $.create('<style type="text/css"></style>')
                .html('.before{ height: 500px } ' +
                    '.after { height: 1000px } ' +
                    '.steady-container { margin: 10px 0; }')
                .appendTo('head');

            callbackFunc = function () {
                var insertedEl = $.create('<div class="js-inserted-container" style="height: 100px;"></div>');
                $container.append(insertedEl);
            };

            // We can't scroll the Phantom window for some reason, so
            // we mock window instead
            sinon.spy(window, 'scrollTo');

            done();
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            $style.remove();
            window.scrollTo.restore();
        });

        it('should exist', function () {
            expect(steadyPage).toBeDefined();
        });

        it('should call scrollTo with the height of the one inserted element', function (done) {

            var prevScrollPos = 1000;
            window.scrollY = prevScrollPos;

            

            steadyPage.insert($container[0], callbackFunc).then(function() {
                expect(window.scrollTo).toHaveBeenCalledWith(0, prevScrollPos + 120);
                expect(document.getElementsByClassName('js-inserted-container').length).toBeTruthy();
                done();
            });

        });

        it('should call scrollTo with the height of the three inserted elements', function (done) {

        });

        it('should call scrollTo with the height of the two inserted elements in different containers', function (done) {

        });

        it('shouldn\'t call scrollTo if the insertion is below current scroll position', function (done) {

        });

        it('should get the height of all the containers', function (done) {

        });

        it('should call the callbacks in the passed array of objects', function (done) {

        });


    });
});
