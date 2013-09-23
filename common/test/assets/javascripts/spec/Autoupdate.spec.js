define(['common', 'ajax', 'bean', 'modules/autoupdate', 'modules/userPrefs', 'helpers/fixtures'], function(common, ajax, bean, Autoupdate, userPrefs, fixtures) {

    describe("Auto update", function() {

        var callback,
            delay,
            path,
            attachTo,
            server,
            userPrefsStub;

        // Have to stub the global guardian object
        window.guardian = {
            userPrefs : {
                set : function() { return true; },
                get : sinon.stub()
            }
        };

        beforeEach(function() {
            fixtures.render({
                id: 'update',
                fixtures: ['<div id="update-area"></div>', '<div class="update"></div>']
            });
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            userPrefsStub = sinon.stub(userPrefs, 'get').returns('on');
            path = 'fixtures/autoupdate';
            delay = 1000;
            attachTo = document.getElementById('update-area');
            callback = sinon.stub();
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;

        });

        afterEach(function() {
            callback = null;
            server.restore();
            userPrefsStub.restore();
            fixtures.clean('update');
            common.mediator.removeListeners(['modules:autoupdate:loaded', 'modules:autoupdate:destroyed'])
        });

        // json test needs to be run asynchronously
        it("should request the feed and attach response to the dom", function(){

            server.respondWith([200, {}, '{ "html": "<span>foo</span>" }']);
            common.mediator.on('modules:autoupdate:loaded', callback);

            attachTo.innerHTML = '<span class="autoupdate--new autoupdate--highlight">bar</span>';

            var a = new Autoupdate({
                path: path,
                delay: delay,
                attachTo: attachTo,
                switches: {autoRefresh: true},
                manipulationType: 'prepend'
            });
            a.init();

            waits(2000);

            runs(function(){
                expect(callback).toHaveBeenCalled();
                expect(attachTo.innerHTML).toBe('<span class="autoupdate--new autoupdate--highlight">foo</span><span class="autoupdate--new autoupdate--highlight">bar</span>');
                a.off();
            });
        });

        it("should optionally load the load the first update immediately after the module has initialised", function(){

            server.respondWith([200, {}, '{ "html": "<span>foo</span>" }']);
            common.mediator.on('modules:autoupdate:loaded', callback);

            var a = new Autoupdate({
                path: path,
                delay: 10000,
                attachTo: attachTo,
                switches: {autoRefresh: true},
                loadOnInitialise: true
            });
            a.init();

            waits(200); // should be shorter than the 'delay' param

            runs(function(){
                expect(callback).toHaveBeenCalled();
                expect(attachTo.innerHTML).toBe('<span>foo</span>');
                a.off();
            });
        });

        it("should get user prefs from local storage ", function(){
            server.respondWith([200, {}, '']);
            userPrefsStub.returns('off');

            var a = new Autoupdate({
                path: path,
                delay: delay,
                attachTo: attachTo,
                switches: {autoRefresh: true}
            });

            a.init();

            waits(2000);

            runs(function(){
                 var off = common.$g('.js-auto-update--off').hasClass('is-active');
                 expect(off).toBe(true);
                 a.off();
            });
        });

        it("should destroy itself if server sends turn off response", function() {
            server.respondWith([200, {}, '{ "refreshStatus": false }']);
            common.mediator.on('modules:autoupdate:destroyed', callback);

            var a = new Autoupdate({
                path: 'fixtures/badupdate',
                delay: delay,
                attachTo: attachTo,
                switches: {autoRefresh: true}
            });
            a.init();

            waits(2000);

            runs(function(){
                expect(callback).toHaveBeenCalled();
                a.off();
            });
        });

        it('should not poll if `autoRefresh` switch turned off (default)', function() {
            server.respondWith([200, {}, '']);
            common.mediator.on('modules:autoupdate:destroyed', callback);

            var a = new Autoupdate({
                path:path,
                delay:delay,
                attachTo: attachTo
            });
            a.init();

            waits(2000);

            runs(function(){
                expect(callback).not.toHaveBeenCalled();
                a.off();
            });
        });

    });
});
