define([
    'common/modules/commercial/adblock-messages',
    'common/modules/navigation/sticky'
], function (
    adblockMsg,
    sut
) {
    describe('Sticky Header', function () {

        describe('getUpdateMethod', function () {

            beforeEach(function () {
                sut.isMobile = false;
                sut.isAppleCampaign = false;
                sut.isProfilePage = false;
            });

            it('should return updatePositionMobile for mobile', function () {
                sut.isMobile = true;
                expect(sut.getUpdateMethod()).toEqual('updatePositionMobile');
            });

            it('should return updatePositionAdblock when Adblock is on and there is no message', function () {
                adblockMsg.noAdblockMsg = function () {
                    return true;
                };

                expect(sut.getUpdateMethod()).toEqual('updatePositionAdblock');
            });

            it('should return updatePositionApple when Apple campaign is on', function () {
                sut.isAppleCampaign = true;
                adblockMsg.noAdblockMsg = function () {
                    return false;
                };

                expect(sut.getUpdateMethod()).toEqual('updatePositionApple');
            });

            it('should return updatePosition when Adblock is on and there is a message', function () {
                adblockMsg.showAdblockMsg = function () {
                    return true;
                };

                expect(sut.getUpdateMethod()).toEqual('updatePosition');
            });

            it('should return updatePosition for all other pages', function () {
                expect(sut.getUpdateMethod()).toEqual('updatePosition');
            });
        });
    });
});

