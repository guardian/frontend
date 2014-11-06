define([
    'qwery',
    'bean',
    'common/utils/$',
    'text!fixtures/ui/container.html',
    'text!fixtures/ui/collection.json',
    'text!common/views/ui/updates.html',
    'text!common/views/ui/updated.html',
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
    updatedTpl,
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
                  },
                  switches: {
                      autoRefresh: true
                  }
              },
              'text!common/views/ui/updates.html' : updatesTpl,
              'text!common/views/ui/updated.html' : updatedTpl
          }
        },
        specify: function () {
            var container = {
                    id: 'container',
                    fixtures: [containerTmpl]
                },
                server,
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;


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
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            });

            function initModule(module, deps, callback) {
                server.respondWith('/football/front-index.json', [200, {}, JSON.stringify(index)]);
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
                    expect($('.js-updates', $container).text()).toBe('1 new story');
                    done();
                });
            });

            it("should request new container markup once call-to-action is clicked", function(fetchUpdates, deps, done) {
                var stub = sinon.stub();
                deps['common/utils/mediator'].once('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:loaded', stub);
                initModule(fetchUpdates, deps, function(){
                    server.respondWith('/football/collections/f3d7d2bc-e667-4a86-974f-fe27daeaebcc/1437282511.json', [200, {}, collectionJson]);
                    deps['common/utils/mediator'].on('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:loaded', function() {
                        expect(stub).toHaveBeenCalled;
                        done();
                    });
                    bean.fire(qwery('.fc-container__update-cta')[0], 'click');
                });
            });

            xit("should hide call-to-action once updated", function(fetchUpdates, deps, done) {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
                initModule(fetchUpdates, deps, function(){
                    server.respondWith('/football/collections/f3d7d2bc-e667-4a86-974f-fe27daeaebcc/1437282511.json', [200, {}, collectionJson]);
                    deps['common/utils/mediator'].on('modules:containers:f3d7d2bc-e667-4a86-974f-fe27daeaebcc:rendered', function() {
                        expect($('.fc-container__update-cta', $container).hasClass('u-h')).toBe(true);
                        done();
                    });
                    bean.fire(qwery('.fc-container__update-cta')[0], 'click');
                });
            });
        }
    });
});
