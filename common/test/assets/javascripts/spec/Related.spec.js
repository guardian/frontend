define(['common/utils/mediator', 'common/utils/ajax', 'common/modules/onward/related', 'helpers/fixtures'], function(mediator, ajax, Related, fixtures) {

    describe("Related", function() {

        var callback, appendTo, server;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK",
                showRelatedContent: true
            }});
            callback = sinon.stub();
            mediator.on('modules:related:loaded', callback);
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
            fixtures.render({
                id: 'related-fixtures',
                fixtures: ['<div class="js-related"></div>']
            });
        });

        afterEach(function() {
            if (appendTo) appendTo.innerHTML = "";
            server.restore();
            fixtures.clean('related-fixtures');
        });

        // json test needs to be run asynchronously
        it("should request the related links and graft them on to the dom", function(){

            var pageId = 'some/news';

            server.respondWith('/related/' + pageId + '.json', [200, {}, '{ "html": "<b>1</b>" }']);

            appendTo = document.querySelector('.js-related');

            runs(function() {
                var r = new Related();
                r.renderRelatedComponent(
                    {page: {pageId: pageId, showRelatedContent: true}, switches: {relatedContent: true}},
                    document
                );
            });

            waits(500);

            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
                expect(appendTo.innerHTML).toBe('<b>1</b>');
            });
        });

        // json test needs to be run asynchronously
        it("should not request related links if switched off", function(){

            appendTo = document.querySelector('.js-related');

            runs(function() {
                new Related(
                    {switches: {relatedContent: false}, page: {}},
                    document
                );
            });

            waits(500);

            runs(function(){
                expect(appendTo.innerHTML).toBe('');
            });
        });

        it("should not request related links if we do not want related content for this article", function(){

            var pageId = 'some/news';

            server.respondWith('/related/' + pageId + '.json', [200, {}, '{ "html": "<b>1</b>" }']);

            appendTo = document.querySelector('.js-related');

            runs(function() {
                var r = new Related();
                r.renderRelatedComponent(
                    {page: {pageId: pageId, showRelatedContent: false}, switches: {relatedContent: true}},
                    document
                );
            });

            waits(500);

            runs(function(){
                expect(appendTo.innerHTML).toBe('');
            });
        });

        xit("should request the related links per edition", function(){
            expect(0).toBeTruthy();
        });

    });
});
