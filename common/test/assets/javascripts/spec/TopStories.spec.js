define([ 'common', 'ajax', 'modules/navigation/top-stories', 'fixtures'], function (common, ajax, TopStories, fixtures) {

    describe("TopStories", function () {

        var conf = {
                id: 'topstories',
                fixtures: ['' +
                    '<div id="control" class="topstories-control" class="is-off">' +
                    '</div>' +
                    '<div id="topstories-header">' +
                    '</div>'
                ]
            },
            page = { pathPrefix: "fixtures", page: { edition: 'uk' }};

        beforeEach(function () {
            ajax.init("");
            fixtures.render(conf)
        });

        it("Should load the current top stories and show the navigation button", function () {

            var callback = sinon.stub();
            common.mediator.on('modules:topstories:loaded', callback);

            runs(function () {
                new TopStories().load(page);
            });

            waitsFor(function () {
                return callback.calledOnce === true
            }, "top-stories callback never called", 500);

            runs(function () {
                var container = document.getElementById('topstories-header')
                    , button = document.getElementById('control');

                expect(callback).toHaveBeenCalledOnce();
                expect(container.innerHTML).toBe('<div class="headline-list box-indent" data-link-name="top-stories"><b>top stories</b></div>');
                expect(button.className).not.toContain('is-off');
            })
        });
    });

});
