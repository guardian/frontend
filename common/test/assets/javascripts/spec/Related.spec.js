define(['common', 'ajax', 'modules/related', 'helpers/fixtures'], function(common, ajax, Related, fixtures) {

    describe("Related", function() {

        var callback, appendTo, server;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            callback = sinon.stub();
            common.mediator.on('modules:related:loaded', callback);
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
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

            server.respondWith('/related/' + pageId + '.json?_edition=UK', [200, {}, '{ "html": "<b>1</b>" }']);

            appendTo = document.querySelector('.js-related');

            runs(function() {
                new Related(
                    {page: {pageId: pageId}, switches: {relatedContent: true}},
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

        xit("should request the related links per edition", function(){
            expect(0).toBeTruthy();
        });

    });
});
