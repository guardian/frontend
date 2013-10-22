define(['common', 'bonzo', 'ajax', 'modules/popular'], function(common, bonzo, ajax, popular) {

    describe("Popular", function() {
        var popularLoadedCallback,
            server,
            $popularContainer;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            popularLoadedCallback = sinon.stub();
            common.mediator.on('modules:popular:loaded', popularLoadedCallback);
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
            $popularContainer = bonzo(bonzo.create('<div>')).addClass('js-popular').appendTo('body');
        });

        afterEach(function () {
            server.restore();
            $popularContainer.remove();
        });

        // json test needs to be run asynchronously
        it("should request the most popular feed and graft it on to the dom", function(){

            var section = 'culture';
            server.respondWith('/most-read/' + section + '.json?_edition=UK', [200, {}, '{ "html": "<b>popular</b>" }']);

            appendTo = document.querySelector('.js-popular');

            runs(function() {
                popular({page: {section: section}}, document);
            });

            waitsFor(function () {
                return popularLoadedCallback.calledOnce === true;
            }, 'popular callback never called', 500);

            runs(function(){
                expect(appendTo.innerHTML).toBe('<b>popular</b>');
            });
        });

        it('should not pass section if section is "global"', function(){

            server.respondWith('/most-read.json?_edition=UK', [200, {}, '{ "html": "<b>popular</b>" }']);

            appendTo = document.querySelector('.js-popular');

            runs(function() {
                popular({page: {section: 'global'}}, document);
            });

            waitsFor(function () {
                return popularLoadedCallback.calledOnce === true;
            }, 'popular callback never called', 500);

            runs(function(){
                expect(appendTo.innerHTML).toBe('<b>popular</b>');
            });
        });

    });
});
