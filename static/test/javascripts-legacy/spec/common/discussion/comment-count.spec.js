define([
    'lib/$',
    'helpers/injector',
    'fixtures/commentcounts'
], function (
    $,
    Injector,
    testData
) {
    describe('Comment counts', function () {

        var injector = new Injector();
        var commentCount;
        var server;
        var mediator;

        var fixtureTrails = '<div class="comment-trails">'
                    + '<div class="trail" data-discussion-id="/p/3ghv5"><a href="/article/1">1</a></div>'
                    + '<div class="trail" data-discussion-id="/p/3ghx3"><a href="/article/2">1</a></div>'
                    + '<div class="trail" data-discussion-id="/p/3gh4n"><a href="/article/3">1</a></div>'
                    + '</div>';

        beforeEach(function (done) {
            injector.mock('common/views/svgs', {
                inlineSvg: function() {
                    return '';
                }
            });
            injector.require([
                'common/modules/discussion/comment-count',
                'lib/mediator'
            ], function(commentCountModule, mediatorModule) {
                commentCount = commentCountModule;
                mediator = mediatorModule;

                $('body').append(fixtureTrails);

                sinon.spy(commentCount, 'getCommentCounts');

                server = sinon.fakeServer.create();
                server.respondWith([
                    200,
                    { 'Content-Type': 'application/json' },
                    testData
                ]);
                server.autoRespond = true;
                server.autoRespondAfter = 20;
                done();
            });
        });

        afterEach(function () {
            $('.comment-trails').remove();
            commentCount.getCommentCounts.restore();
            server.restore();
        });

        it('should get discussion id\'s from the DOM', function () {
            var data = '/p/3gh4n,/p/3ghv5,/p/3ghx3';
            expect(commentCount.getContentIds(commentCount.getElementsIndexedById())).toEqual(data);
        });

        it('should get comment counts from ajax end-point', function (done) {
            mediator.once('modules:commentcount:loaded', function () {
                done();
            });

            commentCount.init();
        });

        it('should append comment counts to DOM', function (done) {
            mediator.once('modules:commentcount:loaded', function () {
                expect($('.fc-trail__count--commentcount').length).toBe(3);
                done();
            });

            commentCount.init();
        });

    });
});
