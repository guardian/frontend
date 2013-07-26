define(['common', 'fixtures', 'ajax', 'modules/navigation/account'], function(common, fixtures, ajax, Account) {

    describe('Account Control', function() {
        var control = new Account(),
            server = sinon.fakeServer.create(),
            containerId = 'account-control',
            controlFixtures = {
                id: containerId,
                fixtures: [
                    '<div id="account-control-container"></div>'
                ]
            };

        // setup server & ajax
        server.autoRespond = true;
        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});

        fixtures.render(controlFixtures);

        describe('Fetching the HTML fragment', function() {
            control = new Account();

            afterEach(function() {
                server.restore();
            });

            it('Fires a loaded event once the HTML has been fetched', function() {
                var callback = sinon.stub();
                common.mediator.on('modules:accountcontrol:loaded', callback);

                server.respondWith([200, {}, '{ "html": "<i>Account fragment</i>" }']);
                control.getAccountFragment(callback);

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Account control to fetch HTML fragment', 500);
            });

            it('Fires an error event when server responds badly', function() {
                var callback = sinon.stub();
                common.mediator.on('modules:accountcontrol:error', callback);

                server.respondWith([500, {}, '{ "error": "Server did a bad bad thing" }']);
                control.getAccountFragment(callback);

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Account control to fetch HTML fragment', 500);
            });

        });

        describe('Rendering the HTML fragment', function() {
            control = new Account();

            afterEach(function() {
                server.restore();
            });

            it('Renders the content fetched from ID', function() {
                server.respondWith([200, {}, '{ "html": "<i>Account fragment</i>" }']);
                
                var context = document.getElementById(containerId);
                control.render(context);
            });

        });
    
    });

})
