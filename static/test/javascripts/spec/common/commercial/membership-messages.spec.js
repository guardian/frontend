define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector',
    'Promise'
], function (
    bonzo,
    fastdom,
    qwery,
    $,
    fixtures,
    Injector,
    Promise
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

            it('should not show any messages even to engaged readers', function (done) {
                membershipMessages.init().then(function () {
                    var message = document.querySelector('.js-site-message.site-message--banner');
                    expect(message).toBeNull();
                }).then(done);
            });
        });

        describe('If user not member', function () {
            beforeEach(function (done) {
                showMembershipMessages = commercialFeatures.async.membershipMessages;
                alreadyVisited = storage.local.get('gu.alreadyVisited');
                commercialFeatures.async.membershipMessages = Promise.resolve(true);
                fixtures.render(conf);
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
                    storage.local.set('gu.alreadyVisited', 10);
                    membershipMessages.init().then(function () {
                        var message = document.querySelector('.js-site-message.site-message--membership-message-uk');
                        expect(message).not.toBeNull();
                    }).then(done);
                });
            });

            describe('of the US edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'US' };
                    storage.local.set('gu.alreadyVisited', 10);
                    membershipMessages.init().then(function () {
                        var message = document.querySelector('.js-site-message.site-message--membership-message-us');
                        expect(message).not.toBeNull();
                    }).then(done);
                });
            });
        });
    });
});
