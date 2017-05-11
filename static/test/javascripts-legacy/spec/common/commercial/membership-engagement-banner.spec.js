define([
    'lib/$',
    'common/modules/user-prefs',
    'helpers/fixtures',
    'helpers/injector',
    'common/modules/ui/message',
    'lib/config'
], function (
    $,
    userPrefs,
    fixtures,
    Injector,
    Message,
    config
) {
    var commercialFeatures, membershipMessages, mediator,
        showMembershipMessages, alreadyVisited, storage, participations;

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

    describe('Membership engagement banner', function () {

        beforeEach(function (done) {
            config.page.edition = 'UK';
            injector.mock('common/views/svgs', {
                inlineSvg: function() {
                    return '';
                }
            });
            injector.require([
                'commercial/modules/commercial-features',
                'common/modules/commercial/membership-engagement-banner',
                'lib/storage',
                'lib/mediator'
            ], function () {
                commercialFeatures = arguments[0];
                membershipMessages = arguments[1];
                storage = arguments[2];
                mediator = arguments[3];
                done();
            }, function () {
                // woohoo
                done();
            });
        });

        function getMessageContent () {
            return document.querySelector('.site-message__message--membership');
        }

        function expectMessageContentNotToBeShown () {
            expect(getMessageContent()).toBeNull();
        }

        function expectMessageToBeShown() {
            var message = document.querySelector('.js-site-message');
            var messageContent = getMessageContent();

            expect(messageContent).not.toBeNull();
            expect(message.className).toContain('membership-prominent');
            expect(message.className).not.toContain('is-hidden');
        }

        function expectMessageNotToBeVisible() {
            var message = document.querySelector('.js-site-message');

            expect(message.className).toContain('is-hidden');
            expect(message.className).not.toContain('membership-message');
        }

        describe('If breaking news banner', function () {
            beforeEach(function (done) {
                showMembershipMessages = commercialFeatures.async.canDisplayMembershipEngagementBanner;
                alreadyVisited = storage.local.get('gu.alreadyVisited');
                commercialFeatures.async.canDisplayMembershipEngagementBanner = Promise.resolve(true);
                fixtures.render(conf);
                storage.local.set('gu.alreadyVisited', 10);
                done();
            });

            afterEach(function () {
                commercialFeatures.async.canDisplayMembershipEngagementBanner = showMembershipMessages;
                storage.local.set('gu.alreadyVisited', alreadyVisited);
                fixtures.clean(conf.id);
                mediator.removeAllListeners();
            });

            it('has shown, should not show the membership engagement banner', function (done) {
                mediator.on('banner-message:complete', function() {
                    expectMessageContentNotToBeShown();
                    done();
                });
                membershipMessages
                    .init()
                    .then(function () {
                        mediator.emit('modules:onwards:breaking-news:ready', true);
                    });
            });

            it('has not shown, should show the membership engagement banner', function (done) {
                mediator.on('banner-message:complete', function() {
                    expectMessageToBeShown();
                    done();
                });
                membershipMessages
                    .init()
                    .then(function () {
                        mediator.emit('modules:onwards:breaking-news:ready', false);
                    });
            });
        });

        describe('If user already member', function () {
            beforeEach(function (done) {
                showMembershipMessages = commercialFeatures.async.canDisplayMembershipEngagementBanner;
                commercialFeatures.async.canDisplayMembershipEngagementBanner = Promise.resolve(false);
                alreadyVisited = storage.local.get('gu.alreadyVisited');
                storage.local.set('gu.alreadyVisited', 10);
                fixtures.render(conf);
                participations = storage.local.get('gu.ab.participations');
                storage.local.remove('gu.ab.participations');
                done();
            });

            afterEach(function () {
                commercialFeatures.async.canDisplayMembershipEngagementBanner = showMembershipMessages;
                storage.local.set('gu.alreadyVisited', alreadyVisited);
                storage.local.set('gu.ab.participations', participations);
                fixtures.clean(conf.id);
                mediator.removeAllListeners();
            });

            it('should not show any messages even to engaged readers', function(done) {
                mediator.on('banner-message:complete', function() {
                    expectMessageContentNotToBeShown();
                    done();
                });
                membershipMessages
                    .init()
                    .then(function () {
                        mediator.emit('modules:onwards:breaking-news:ready', false);
                    });
            });
        });

        describe('If user not member', function () {
            beforeEach(function (done) {
                showMembershipMessages = commercialFeatures.async.canDisplayMembershipEngagementBanner;
                alreadyVisited = storage.local.get('gu.alreadyVisited');
                commercialFeatures.async.canDisplayMembershipEngagementBanner = Promise.resolve(true);
                fixtures.render(conf);
                storage.local.set('gu.alreadyVisited', 10);
                done();
            });

            afterEach(function () {
                commercialFeatures.async.canDisplayMembershipEngagementBanner = showMembershipMessages;
                storage.local.set('gu.alreadyVisited', alreadyVisited);
                mediator.removeAllListeners();
                fixtures.clean(conf.id);
            });

            describe('of the UK edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'UK' };
                    mediator.on('banner-message:complete', function() {
                        expectMessageToBeShown();
                        done();
                    });
                    membershipMessages
                        .init()
                        .then(function () {
                            mediator.emit('modules:onwards:breaking-news:ready', false);
                        });
                });
            });

            describe('of the US edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'US' };
                    mediator.on('banner-message:complete', function() {
                        expectMessageToBeShown();
                        done();
                    });
                    membershipMessages
                        .init()
                        .then(function () {
                            mediator.emit('modules:onwards:breaking-news:ready', false);
                        });
                });
            });

            describe('of the International edition', function () {
                it('should show a message to engaged readers', function (done) {
                    config.page = { edition: 'INT' };
                    mediator.on('banner-message:complete', function() {
                        expectMessageToBeShown();
                        done();
                    });
                    membershipMessages
                        .init()
                        .then(function () {
                            mediator.emit('modules:onwards:breaking-news:ready', false);
                        });
                });
            });

            describe('but has already closed a message', function () {
                it('should not redisplay that message', function (done) {
                    var message = new Message(membershipMessages.messageCode);

                    message.acknowledge();
                    config.page = { edition: 'UK' };
                    mediator.on('banner-message:complete', function() {
                        expectMessageNotToBeVisible();
                        done();
                    });
                    membershipMessages
                        .init()
                        .then(function () {
                            mediator.emit('modules:onwards:breaking-news:ready', false);
                        });
                });
            });
        });
    });
});
