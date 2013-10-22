define([ 'common', 'ajax', 'modules/navigation/top-stories', 'helpers/fixtures'], function (common, ajax, TopStories, fixtures) {

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
            config = { page: { edition: 'uk' }},
            server;

        beforeEach(function () {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            fixtures.render(conf);
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
        });

        afterEach(function () {
            fixtures.clean(conf.id);
            server.restore();
        });

        it("Should load the current top stories and show the navigation button", function () {

            var callback = sinon.stub();
            common.mediator.on('modules:topstories:loaded', callback);

            server.respondWith([200, {}, '{ "html": "<b>top stories</b>" }']);

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
                expect(container.innerHTML).toBe('<h3 class="headline-list__title">Top stories</h3><div class="headline-list box-indent" data-link-name="top-stories"><b>top stories</b></div>');
                expect(button.className).not.toContain('is-off');
            })
        });
    });

});
