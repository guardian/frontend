define([
    'helpers/injector',
    'common/utils/storage'
], function (
    Injector,
    storage
) {
    var injector = new Injector();

    describe('Adblock messages/banners rules', function () {
        var adblockMessage, config, detect, userFeatures, mockUserHasAdblock, mockBreakpoint;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/adblock-messages',
                'common/utils/config',
                'common/utils/detect',
                'common/modules/commercial/user-features'
            ], function () {
                adblockMessage = arguments[0];
                config = arguments[1];
                detect = arguments[2];
                userFeatures = arguments[3];

                detect.adblockInUse = function () {
                    return mockUserHasAdblock;
                };
                detect.getBreakpoint = function () {
                    return mockBreakpoint;
                };
                done();
            });
        });

        it('should not show adblock messages for the first time users', function () {
            storage.local.set('gu.alreadyVisited', 0);
            config.switches.adblock = true;
            mockUserHasAdblock = true;
            mockBreakpoint = 'desktop';

            expect(adblockMessage.noAdblockMsg()).toBe(true);
        });

        it('should not show adblock messages when the adblock switch is off', function () {
            storage.local.set('gu.alreadyVisited', 10);
            config.switches.adblock = false;
            mockUserHasAdblock = true;
            mockBreakpoint = 'desktop';

            expect(adblockMessage.noAdblockMsg()).toBe(true);
        });

        it('should not show adblock messages for non adblock users', function () {
            storage.local.set('gu.alreadyVisited', 10);
            config.switches.adblock = true;
            mockUserHasAdblock = false;
            mockBreakpoint = 'desktop';

            expect(adblockMessage.showAdblockMsg()).toBe(false);
        });

        it('should not show adblock messages for paying members', function () {
            storage.local.set('gu.alreadyVisited', 10);
            config.switches.adblock = true;
            mockUserHasAdblock = true;
            mockBreakpoint = 'desktop';
            userFeatures.isPayingMember = function () {
                return true;
            };

            expect(adblockMessage.noAdblockMsg()).toBe(true);
        });

        it('should show adblock messages for non paying members', function () {
            storage.local.set('gu.alreadyVisited', 10);
            config.switches.adblock = true;
            mockUserHasAdblock = true;
            mockBreakpoint = 'desktop';
            userFeatures.isPayingMember = function () {
                return false;
            };

            expect(adblockMessage.showAdblockMsg()).toBe(true);
        });
    });
});
