define([ 'common', 'ajax', 'modules/navigation/top-stories', 'fixtures'], function (common, ajax, TopStories, fixtures) {

    describe("TopStories", function () {

        var conf = {
                id: 'topstories',
                fixtures: ['' +
                    '<div id="topstories-context">' +
                        '<div class="control topstories-control" class="is-off">' +
                        '</div>' +
                        '<div class="nav-popup-topstories">' +
                        '</div>' +
                    '</div>'
                ]
            },
            config = { pathPrefix: "fixtures", page: { edition: 'uk' }};

        beforeEach(function () {
            ajax.init("");
            fixtures.render(conf)
        });

        it("Should load the current top stories and show the navigation button", function () {

            var callback = sinon.stub();
            common.mediator.on('modules:topstories:loaded', callback);

            runs(function () {
                new TopStories().load(config, document.querySelector('#topstories-context'));
            });

            waitsFor(function () {
                return callback.calledOnce === true
            }, "top-stories callback never called", 500);

            runs(function () {
                var container = document.querySelector('#topstories-context .nav-popup-topstories'),
                    button    = document.querySelector('#topstories-context .control');

                expect(callback).toHaveBeenCalledOnce();
                expect(container.innerHTML).toBe('<h3 class="headline-list__tile type-5">Top stories</h3><div class="headline-list headline-list--top box-indent" data-link-name="top-stories"><b>top stories</b></div>');
                expect(button.className).not.toContain('is-off');
            })
        });
    });

});
