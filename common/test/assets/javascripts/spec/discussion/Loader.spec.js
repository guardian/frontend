define([
    'common',
    'ajax',
    'bean',
    'helpers/fixtures'
], function(
    common,
    ajax,
    bean,
    fixtures
) {

    describe('Discussion Loader', function() {

        var context, server,
            fixturesId = 'discussion-loader',
            fixture = {
                id: fixturesId,
                fixtures: [
                    '<a class="d-show-cta js-show-discussion" href="/discussion/p/3ht42" data-is-ajax data-link-name="View all comments" data-discussion-id="@article.shortUrlId">View all comments <span class="d-commentcount speech-bubble"><span class="js-commentcount__number"></span></span></a>'
                ]
            };

        // setup
        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});

        // rerender the button each time
        beforeEach(function() {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            fixtures.render(fixture);
            context = document.getElementById(fixturesId);
            RecommendComments.init(context);
        });

        afterEach(function() {
            fixtures.clean();
            server.restore();
        });


    });

}); //define