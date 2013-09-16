define([
    'common',
    'ajax',
    'bean',
    'helpers/fixtures',
    'modules/discussion/recommend-comments'
], function(
    common,
    ajax,
    bean,
    fixtures,
    RecommendComments
) {
    describe('Recommend Comment', function() {
        var context,
            recommendComments,
            buttons, button1, button2,
            fixturesId = 'recommend-comment-container',
            recommendCommentFixture = {
                id: fixturesId,
                fixtures: [
                    '<div class="d-comment__recommend js-recommend-comment" data-comment-id="200" data-recommend-count="3" title="3 recommendations"><i class="i i-recommend"></i><span class="d-comment__recommend-count js-recommend-count">3</span></div>'+
                    '<div class="d-comment__recommend js-recommend-comment" data-comment-id="201" data-recommend-count="567" title="567 recommendations"><i class="i i-recommend"></i><span class="d-comment__recommend-count js-recommend-count">567</span></div>'
                ]
            };

        // setup
        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});
        server = sinon.fakeServer.create();
        server.autoRespond = true;
        fixtures.render(recommendCommentFixture);
        context = document.getElementById(fixturesId);
        buttons = context.querySelectorAll('.d-comment__recommend');
        button1 = buttons[0];
        button2 = buttons[1];

        RecommendComments.init(context);

        describe('init', function() {
            it('Should make buttons look clickable', function() {
                expect(button1.className.match('d-comment__recommend--active')).toBeTruthy();
            });
        });

        // TODO: Perhaps break this into success and failure
        //       There is multiple things each need to do (especially success)
        describe('click', function() {
            it('Should update the recommend count and remain unchanged on success', function() {
                var currentCount = parseInt(button1.getAttribute('data-recommend-count'), 10),
                    successFunction = jasmine.createSpy();

                common.mediator.on(RecommendComments.getEvent('success'), successFunction);
                server.respondWith([200, {}, '{"status": "ok", "message": "63 total recommendations", "statusCode": 200}']);

                runs(function() {
                    bean.fire(button1, 'click');
                });

                waitsFor(function() {
                    return successFunction.calls.length > 0;
                }, 500);

                runs(function() {
                    expect(parseInt(button1.getAttribute('data-recommend-count'), 10)).toEqual(currentCount+1);
                    expect(button1.querySelector('.'+ RecommendComments.CONFIG.classes.count).innerHTML).toEqual(''+(currentCount+1));
                });
            });

            it('Should reset the recommend count on fail', function() {
                var currentCount = parseInt(button2.getAttribute('data-recommend-count'), 10),
                    failFunction = jasmine.createSpy();

                common.mediator.on(RecommendComments.getEvent('fail'), failFunction);
                server.respondWith([400, {}, '{"status": "error", "message": "wrong", "statusCode": 400}']);

                runs(function() {
                    bean.fire(button2, 'click');
                });

                waitsFor(function() {
                    return failFunction.calls.length > 0;
                }, 500);

                runs(function() {
                    expect(parseInt(button2.getAttribute('data-recommend-count'), 10)).toEqual(currentCount);
                    expect(button2.querySelector('.'+ RecommendComments.CONFIG.classes.count).innerHTML).toEqual(''+(currentCount));
                });
            });
        });

    });

});