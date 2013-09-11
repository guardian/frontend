define([
    'common',   
    'helpers/fixtures',
    'modules/discussion/recommend-comments'
], function(
    common,
    fixtures,
    RecommendComments
) {
    describe('Recommend Comment', function() {
        var context,
            recommendComments,
            fixturesId = 'recommend-comment-container',
            recommendCommentFixture = {
                id: fixturesId,
                fixtures: [
                    '<div class="d-comment__action d-comment__action--recommend cta '+ RecommendComments.CONFIG.classes.button +'" data-comment-id="246">Recommended (<span class="d-comment__recommend-count js-recommend-count" data-recommend-count="12">12</span>)</div>'+
                    '<div class="d-comment__action d-comment__action--recommend cta '+ RecommendComments.CONFIG.classes.button +'" data-comment-id="32">Recommended (<span class="d-comment__recommend-count js-recommend-count" data-recommend-count="543">543</span>)</div>'
                ]
            };

        fixtures.render(recommendCommentFixture);
        context = document.getElementById(fixturesId);

        describe('#bindEvents', function() {
            it('Should bind the recommend action to buttons', function() {
                RecommendComments.bindEvents(context);
            });
        });

    });

});