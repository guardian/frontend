define([ 'common',
         'modules/navigation/top-stories',
         'fixtures'], function(common, TopStories, fixtures) {

    describe("TopStories", function() {

        var conf = {
                    id: 'topstories',
                    fixtures: ['<div id="control" class="topstories-control" class="is-off">' +
                               '</div>' +
                               '<div id="topstories-header">' +
                               '</div>']
                   },
            page = { page: { coreNavigationUrl: 'fixtures/', edition: 'uk' }};

        beforeEach(function() {
            fixtures.render(conf)
        });

        it("Should load the current top stories and show the navigation button", function(){

           var callback = sinon.spy(function(){});
           common.mediator.on('modules:topstories:loaded', callback);

           runs(function() {
                var t = new TopStories().load(page);
           });

           waitsFor(function() {
                return callback.calledOnce === true
                }, "top-stories callback never called", 500);

           runs(function() {
                var container = document.getElementById('topstories-header')
                  , button = document.getElementById('control');

                expect(callback).toHaveBeenCalledOnce();
                expect(container.innerHTML).toBe('<div class="headline-list box-indent" data-link-name="top-stories"><b>top stories</b></div>');
                expect(button.className).not.toContain('is-off');
           })
        });
    });

});
