define(['common', 'fixtures', 'ajax', 'modules/navigation/profile'], function(common, fixtures, ajax, Profile) {

    describe('Profile navigation', function() {
        var context,
            control,
            server = sinon.fakeServer.create(),
            containerId = 'profile-control-container',
            config = {page: {
                idUrl: 'https://profile.theguardian.co.uk'
            }},
            controlFixtures = {
                id: containerId,
                fixtures: [
                    '<div class="' + Profile.CONFIG.classes.content + '"></div>'
                ]
            };

        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});

        fixtures.render(controlFixtures);
        context = document.getElementById(containerId);

        describe('Fetching the HTML fragment', function() {
            control = new Profile(config, context);

            beforeEach(function() {
                server = sinon.fakeServer.create();
                server.autoRespond = true;
            });

            afterEach(function() {
                server.restore();
            });

            it('Fires a loaded event once the HTML has been fetched', function() {
                var callback = sinon.stub();
                common.mediator.on('modules:profilenav:loaded', callback);

                server.respondWith([200, {}, '{ "html": "<i>Profile fragment</i>" }']);
                control.getNavigationFragment();

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Profile control to fetch HTML fragment', 500);
            });

            it('Fires an error event when server responds badly', function() {
                var callback = sinon.stub();
                common.mediator.on('modules:profilenav:error', callback);

                server.respondWith([500, {}, '{ "error": "Server did a bad bad thing" }']);
                control.getNavigationFragment();

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Profile control to throw error', 500);
            });

        });

        describe('Rendering the HTML fragment', function() {
            control = new Profile(config, context);
            
            beforeEach(function() {
                server = sinon.fakeServer.create();
                server.autoRespond = true;
            });

            afterEach(function() {
                server.restore();
            });

            it('Renders the content fetched from ID fragment', function() {
                var content = '<i>auserwithmassintent</i>',
                    callback = sinon.stub();

                server.respondWith([200, {}, '{ "html": "' + content + '" }']);

                common.mediator.on('modules:profilenav:rendered', callback);
                control.init();

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Render to fetch content', 500);

                runs(function() {
                     expect(context.querySelector('.' + Profile.CONFIG.classes.content).innerHTML).toEqual(content);
                });
            });

        });
    
    });

})
