define(['common', 'fixtures', 'ajax', 'modules/navigation/account'], function(common, fixtures, ajax, Account) {

    describe('Account Control', function() {
        var context,
            control = new Account(),
            server = sinon.fakeServer.create(),
            containerId = 'account-control-container',
            controlFixtures = {
                id: containerId,
                fixtures: [
                    '<div class="' + Account.CONFIG.className + '"></div>'
                ]
            };

        ajax.init({page: {
            ajaxUrl: '',
            edition: 'UK'
        }});

        fixtures.render(controlFixtures);
        context = document.getElementById(containerId);

        describe('Fetching the HTML fragment', function() {
            control = new Account();

            beforeEach(function() {
                server = sinon.fakeServer.create();
                server.autoRespond = true;
            });

            afterEach(function() {
                server.restore();
            });

            it('Fires a loaded event once the HTML has been fetched', function() {
                var callback = sinon.stub();
                common.mediator.on('modules:accountcontrol:loaded', callback);

                server.respondWith([200, {}, '{ "html": "<i>Account fragment</i>" }']);
                control.getAccountFragment();

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Account control to fetch HTML fragment', 500);
            });

            it('Fires an error event when server responds badly', function() {
                var callback = sinon.stub();
                common.mediator.on('modules:accountcontrol:error', callback);

                server.respondWith([500, {}, '{ "error": "Server did a bad bad thing" }']);
                control.getAccountFragment();

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Account control to throw error', 500);
            });

        });

        describe('Rendering the HTML fragment', function() {
            control = new Account(context);
            
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

                common.mediator.on('modules:accountcontrol:rendered', callback);
                control.render();

                waitsFor(function() {
                    return callback.calledOnce === true;
                }, 'Render to fetch content', 500);

                runs(function() {
                     expect(context.querySelector('.' + Account.CONFIG.className).innerHTML).toEqual(content);
                });
            });

        });
    
    });

})
