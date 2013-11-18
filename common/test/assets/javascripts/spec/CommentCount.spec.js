define([
    'common',
    'utils/ajax',
    'modules/discussion/comment-count',
    'fixtures/commentcounts'], function(
    common,
    ajax,
    commentCount,
    testData) {

    describe("Comment counts", function() {

        var server;

        var fixtureTrails = '<div class="comment-trails">'
                    + '<div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/1">1</a></div>'
                    + '<div class="trail" data-discussion-id="/p/3ghx3"><a href="/article/2">1</a></div>'
                    + '<div class="trail" data-discussion-id="/p/3gh4n"><a href="/article/3">1</a></div>'
                    + '</div>';

        ajax.init({page: {
            ajaxUrl: "",
            edition: "UK"
        }});

        beforeEach(function() {

            common.$g('body').append(fixtureTrails);

            sinon.spy(common.mediator, 'emit');
            sinon.spy(commentCount, 'getCommentCounts');

            server = sinon.fakeServer.create();
            server.respondWith([
                200,
                { "Content-Type": "application/json" },
                testData
            ]);

            commentCount.init(document);

            server.respond();
        });

        afterEach(function() {
            common.$g('.comment-trails').remove();
            commentCount.getCommentCounts.restore();
            common.mediator.emit.restore();
            server.restore();
        });

        it("should get discussion id's from the DOM", function(){
            var data = '/p/3ghv5,/p/3ghx3,/p/3gh4n';
            expect(commentCount.getContentIds(document)).toEqual(data);
        });

        it("should get comment counts from ajax end-point", function(){
            waits(function() {
                expect(common.mediator.emit).toHaveBeenCalledWith('modules:commentcount:loaded');
            });
        });

        it("should append comment counts to DOM", function(){
            waits(function() {
                expect(query.selectorAll('.trail__count--commentcount').length).toBe(3)
            });
        });

        it("re run when new trail appear in DOM", function(){
            waits(function() {
                //common.mediator.emit('module:trailblock-show-more:render');
                expect(commentCount.getCommentCounts.calledTwice).toBe(true)
            });
        });

    });
});
