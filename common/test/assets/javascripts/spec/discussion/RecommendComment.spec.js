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
            buttons, button,
            currentCount,
            fixturesId = 'recommend-comment-container',
            recommendCommentFixture = {
                id: fixturesId,
                fixtures: [
                    '<div class="d-comment__recommend js-recommend-comment" data-comment-id="200" data-recommend-count="3" title="3 recommendations"><i class="i i-recommend"></i><span class="d-comment__recommend-count js-recommend-count">3</span></div>'
                ]
            };

        // setup
        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});
        server = sinon.fakeServer.create();
        server.autoRespond = true;

        // rerender the button each time
        beforeEach(function() {
            fixtures.render(recommendCommentFixture);
            context = document.getElementById(fixturesId);
            button = context.querySelectorAll('.d-comment__recommend')[0];
            RecommendComments.init(context);
        });

        afterEach(function() {
            fixtures.clean();
        });

        describe('init', function() {
            it('Should make recommend counts active', function() {
                expect(button.className.match(RecommendComments.CONFIG.classes.active)).toBeTruthy();
            });
        });

        describe('click', function() {
            beforeEach(function() {
                currentCount = parseInt(button.getAttribute('data-recommend-count'), 10);
                bean.fire(button, 'click');
            });

            it('should update recommend count', function() {
                expect(parseInt(button.getAttribute('data-recommend-count'), 10)).toEqual(currentCount+1);
                expect(button.querySelector('.'+ RecommendComments.CONFIG.classes.count).innerHTML).toEqual(''+(currentCount+1));
            });

            it('should remove the button active state', function() {
                expect(button.className.match(RecommendComments.CONFIG.classes.active)).not.toBeTruthy();
            });

            it('should add the recommended state to the button', function() {
                expect(button.className.match(RecommendComments.CONFIG.classes.recommended)).not.toBeNull();
            });
        });

        describe('success', function() {
            it('should fire a success event', function() {
                var successFunction = jasmine.createSpy();
                server.respondWith([200, {}, '{"status": "ok", "message": "63 total recommendations", "statusCode": 200}']);
                common.mediator.on(RecommendComments.getEvent('success'), successFunction);

                runs(function() {
                    bean.fire(button, 'click');
                });

                waitsFor(function() {
                    return successFunction.calls.length > 0;
                }, 500);
            });
        });

        describe('fail', function() {
            // these test are somewhat dependant on the "click" tests to pass
            // we use passCondition to make sure it fails at least once
            // this is to prove it is happening on the XHR response
            // TODO: perhaps find a way to have that check abstracted
            var clicked, passCondition;

            beforeEach(function() {
                clicked = false;
                passCondition = false;
                server.respondWith([400, {}, '{"status": "error", "message": "wrong", "statusCode": 400}']);
                currentCount = parseInt(button.getAttribute('data-recommend-count'), 10);
            });

            it('should reset the comment count', function() {
                runs(function() {
                    bean.fire(button, 'click');
                });

                waitsFor(function() {
                    var passCondition = (parseInt(button.getAttribute('data-recommend-count'), 10) === currentCount &&
                                        button.querySelector('.'+ RecommendComments.CONFIG.classes.count).innerHTML === ''+(currentCount));

                    if (passCondition === false) {
                        clicked = true;
                    }
                    return clicked && passCondition;
                }, 500);
            });

            it('should make button active', function() {
                runs(function() {
                    bean.fire(button, 'click');
                });

                waitsFor(function() {
                    passCondition = button.className.match(RecommendComments.CONFIG.classes.active);
                    if (passCondition === null) {
                        clicked = true;
                    }
                    return clicked && passCondition;
                }, 500);
            });

            it('should remove recommended state from button', function() {
                runs(function() {
                    bean.fire(button, 'click');
                });

                waitsFor(function() {
                    passCondition = !button.className.match(RecommendComments.CONFIG.classes.userRecommended);
                    if (passCondition === false) {
                        clicked = true;
                    }
                    return clicked && passCondition;
                }, 500);
            });
        });
    });

});