define([
    'common',
    'ajax',
    'bean',
    'helpers/fixtures',
    'modules/discussion/loader'
], function(
    common,
    ajax,
    bean,
    fixtures,
    DiscussionLoader
) {

    describe('Discussion Loader', function() {
        // Setup
        var context, button, server,
            fixturesId = 'discussion-loader',
            fixture = {
                id: fixturesId,
                fixtures: [
                    '<a class="'+ DiscussionLoader.CONFIG.classes.getDiscussion +' d-show-cta" href="/discussion/p/3ht42" data-is-ajax data-link-name="View all comments" data-discussion-id="/p/3ht42">View all comments <span class="d-commentcount speech-bubble"><span class="js-commentcount__number"></span></span></a>'
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
            // server.autoRespond = true;
            fixtures.render(fixture);
            context = document.getElementById(fixturesId);
            button = context.querySelector('.'+ DiscussionLoader.CONFIG.classes.getDiscussion);
            DiscussionLoader.init(context);
        });

        afterEach(function() {
            server.restore();
            fixtures.clean();
        });

        describe('init', function() {

            it('should bind load to click events on '+ DiscussionLoader.CONFIG.classes.getDiscussion +' elements', function() {
                var callback = jasmine.createSpy();
            });

        });



    });

}); //define