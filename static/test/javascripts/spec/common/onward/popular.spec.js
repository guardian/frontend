define(['common/utils/mediator', 'bonzo', 'common/utils/ajax', 'common/modules/onward/popular'], function(mediator, bonzo, ajax, popular) {

    describe("Popular", function() {
        var server,
            $popularContainer;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
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
        it("should request the most popular feed and graft it on to the dom", function (done) {

            var section = 'culture';
            server.respondWith('/most-read/' + section + '.json', [200, {}, '{ "html": "<b>popular</b>" }']);

            appendTo = document.querySelector('.js-popular');

            mediator.once('modules:popular:loaded', function () {
                expect(appendTo.innerHTML).toBe('<b>popular</b>');
                done();
            });

            popular({page: {section: section}});
        });

    });
});
