define(['common/modules/navigation/sticky'], function (sut) {
    describe('Sticky Header', function () {

        describe('getUpdateMethod', function () {

            beforeEach(function () {
                sut.isMobile = false;
                sut.isAdblockInUse = false;
                sut.isAppleCampaign = false;
                sut.isProfilePage = false;
            });

            it('should return updatePositionMobile for mobile', function () {
                sut.isMobile = true;
                expect(sut.getUpdateMethod()).toEqual('updatePositionMobile');
            });

            it('should return updatePositionAdblock for adblock', function () {
                sut.isAdblockInUse = true;
                expect(sut.getUpdateMethod()).toEqual('updatePositionAdblock');
            });

            it('should return updatePositionApple for when Apple campaing is on', function () {
                sut.isAppleCampaign = true;
                expect(sut.getUpdateMethod()).toEqual('updatePositionApple');
            });

            it('should return updatePosition for all other pages', function () {
                expect(sut.getUpdateMethod()).toEqual('updatePosition');
            });
        });
    });
});

