define([
    'helpers/injector',
    'common/utils/storage'
], function (
    Injector,
    storage
) {
    var injector = new Injector();

    describe('Adblock messages', function () {
        var adblockMessage, config, detect, userFeatures;

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
                done();
            });
        });

        describe('If adblock banners and messages should be shown', function () {
            it('should not show adblock messages for users who are for the first time', function () {
                storage.local.set('gu.alreadyVisited', 0);
                config.switches.adblock = true;
                detect.adblockInUse = function () {
                    return true;
                };
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                userFeatures.isPayingMember = function () {
                    return true;
                };

                console.log(adblockMessage.noAdblockMsg());
                expect(adblockMessage.noAdblockMsg()).toBe(true);
            });

            it('should not show adblock messages for paying members', function () {
                storage.local.set('gu.alreadyVisited', 10);
                config.switches.adblock = true;
                detect.adblockInUse = function () {
                    return true;
                };
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                userFeatures.isPayingMember = function () {
                    return true;
                };

                expect(adblockMessage.noAdblockMsg()).toBe(true);
            });

            it('should show adblock messages for non paying members', function () {
                storage.local.set('gu.alreadyVisited', 10);
                config.switches.adblock = true;
                detect.adblockInUse = function () {
                    return true;
                };
                detect.getBreakpoint = function () {
                    return 'desktop';
                };
                userFeatures.isPayingMember = function () {
                    return false;
                };

                expect(adblockMessage.showAdblockMsg()).toBe(true);
            });
        });
    });
});
