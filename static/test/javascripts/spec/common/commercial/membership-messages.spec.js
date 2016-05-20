define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/modules/user-prefs',
    'helpers/fixtures',
    'helpers/injector',
    'Promise',
    'common/modules/ui/message'
], function (
    bonzo,
    fastdom,
    qwery,
    $,
    userPrefs,
    fixtures,
    Injector,
    Promise,
    Message
) {
    var commercialFeatures, membershipMessages,
        showMembershipMessages, alreadyVisited, storage, config;

    var injector = new Injector();

    var conf = {
        id: 'message',
        fixtures: [
            '<div id="header" class="l-header"></div>' +
            '<div class="js-site-message is-hidden">' +
                '<div class="js-site-message-copy">...</div>' +
                '<button class="site-message__close"></button>' +
            '</div>' +
            '<div class="site-message--footer is-hidden js-footer-message"> ' +
                '<div class="site-message__copy js-footer-site-message-copy u-cf"></div> ' +
            '</div>'
        ]
    };

    describe('Membership messages', function () {

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/commercial-features',
                'common/modules/commercial/membership-messages',
                'common/utils/config',
                'common/utils/storage'
            ], function () {
                commercialFeatures = arguments[0];
                membershipMessages = arguments[1];
                storage = arguments[3];
                config = arguments[2];
                done();
            });
        });

        function expectMessageToBeShown(done) {
            membershipMessages.init().then(function () {
                var message = document.querySelector('.js-site-message');
                expect(message).not.toBeNull();
                expect(message.className).toContain('membership-message');
                expect(message.className).not.toContain('is-hidden');
            }).then(done);
        }

        function expectMessageNotToBeShown(done) {
            membershipMessages.init().then(function () {
                var message = document.querySelector('.js-site-message');
                expect(message).toBeNull();
            }).then(done);
        }

        function expectMessageNotToBeVisible(done) {
            membershipMessages.init().then(function () {
                var message = document.querySelector('.js-site-message');
                expect(message.className).toContain('is-hidden');
                expect(message.className).not.toContain('membership-message');
            }).then(done);
        }

        describe('If user already member', function () {
            beforeEach(function (done) {
                showMembershipMessages = commercialFeatures.async.membershipMessages;
                commercialFeatures.async.membershipMessages = Promise.resolve(false);
                alreadyVisited = storage.local.get('gu.alreadyVisited');
                storage.local.set('gu.alreadyVisited', 10);
                done();
            });

            afterEach(function () {
                commercialFeatures.async.membershipMessages = showMembershipMessages;
                storage.local.set('gu.alreadyVisited', alreadyVisited);
            });

            it('should not show any messages even to engaged readers', expectMessageNotToBeShown);
        });

        describe('If user not member', function () {
            beforeEach(function (done) {
                showMembershipMessages = commercialFeatures.async.membershipMessages;
                alreadyVisited = storage.local.get('gu.alreadyVisited');
                commercialFeatures.async.membershipMessages = Promise.resolve(true);
                fixtures.render(conf);
                storage.local.set('gu.alreadyVisited', 10);
                done();
            });

            afterEach(function () {
                commercialFeatures.async.membershipMessages = showMembershipMessages;
                storage.local.set('gu.alreadyVisited', alreadyVisited);
                fixtures.clean(conf.id);
            });

            describe('of the UK edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'UK' };
                    expectMessageToBeShown(done);
                });
            });

            describe('of the US edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'US' };
                    expectMessageToBeShown(done);
                });
            });

            describe('of the International edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'INT' };
                    expectMessageToBeShown(done);
                });
            });

            describe('but has already closed a message', function () {
                it('should not redisplay that message', function (done) {
                    var edition = 'UK';
                    var message = new Message(membershipMessages.messages[edition].code);
                    message.acknowledge();

                    config.page = { edition: edition };

                    expectMessageNotToBeVisible(done);
                });
            });
        });
    });
});
