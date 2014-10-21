define([
    'qwery',
    'bean',
    'common/utils/$',
    'text!fixtures/ui/container.html',
    'text!fixtures/ui/collection.json',
    'text!common/views/ui/updates.html',
    'fixtures/ui/front-index',
    'helpers/fixtures',
    'jasq'
], function(
    qwery,
    bean,
    $,
    containerTmpl,
    collectionJson,
    updatesTpl,
    index,
    fixtures
) {

    describe("Fetch container updates", {
        moduleName: 'facia/modules/ui/container-fetch-updates',
        mock: function() {
          return {
              'common/utils/config': {
                  page: {
                      pageId: 'football',
                      ajaxUrl: "",
                      edition: "UK"
                  }
              },
              'text!common/views/ui/updates.html' : updatesTpl
          }
        },
        specify: function () {
            var container = {
                    id: 'container',
                    fixtures: [containerTmpl]
                },
                server;

            beforeEach(function () {
                // set up fake server
                server = sinon.fakeServer.create();
                server.autoRespond = true;
                server.autoRespondAfter = 20;
                $container = fixtures.render(container);
            });

            afterEach(function () {
                server.restore();
                fixtures.clean(container.id);
            });

            function initModule(module, deps, callback) {
                server.respondWith('football/front-index.json', [200, {}, JSON.stringify(index)]);
                deps['common/utils/ajax'].init();
                deps['common/utils/mediator'].on("modules:containers:update", callback);
                module();
            }

            it("should request potential updates from server", function(fetchUpdates, deps, done) {
                var stub = sinon.stub();
                deps['common/utils/mediator'].once("modules:containers:update", stub);
                initModule(fetchUpdates, deps, function() {
                    expect(stub).toHaveBeenCalled;
                    done();
                });

            });

            it("should attach call-to-action to DOM if updates exist", function(fetchUpdates, deps, done) {
                initModule(fetchUpdates, deps, function(){
                    expect($('.fc-container__update-cta', $container).length).toBe(1);
                    done();
                });
            });

            it("should display update count in call-to-action", function(fetchUpdates, deps, done) {
                initModule(fetchUpdates, deps, function(){
                    expect($('.js-updates', $container).text()).toBe('1 update');
                    done();
                });
            });

            it("should request new container markup once call-to-action is clicked", function(fetchUpdates, deps, done) {
                var stub = sinon.stub();
                deps['common/utils/mediator'].once('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:loaded', stub);
                initModule(fetchUpdates, deps, function(){
                    server.respondWith('football/collections/f3d7d2bc-e667-4a86-974f-fe27daeaebcc/1437282511.json', [200, {}, collectionJson]);
                    deps['common/utils/mediator'].on('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:loaded', function() {
                        expect(stub).toHaveBeenCalled;
                        done();
                    });
                    bean.fire(qwery('.fc-container__update-cta')[0], 'click');
                });
            });

            it("should replace container items with new updates", function(fetchUpdates, deps, done) {
                var stub = sinon.stub();
                deps['common/utils/mediator'].once('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:loaded', stub);
                initModule(fetchUpdates, deps, function(){
                    server.respondWith('football/collections/f3d7d2bc-e667-4a86-974f-fe27daeaebcc/1437282511.json', [200, {}, collectionJson]);
                    deps['common/utils/mediator'].on('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:loaded', function() {
                        expect($('[data-id=football/2014/oct/20/hillsborough-inquest-ch-insp-is-covering-up-his-cover-up]', $container).length).toBe(1);
                        done();
                    });
                    bean.fire(qwery('.fc-container__update-cta')[0], 'click');
                });
            });
        }
    });
});