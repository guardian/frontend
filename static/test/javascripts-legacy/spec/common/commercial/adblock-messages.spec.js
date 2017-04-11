define([
    'helpers/injector',
    'lib/storage',
    'lib/config'
], function (
    Injector,
    storage,
    config
) {
    var injector = new Injector();

    describe('Adblock messages/banners rules', function () {
        var counter = 0;
        var settings= [
            {
            adBlocker : true,
            alreadyVisited : 0,
            switch : true,
            mockhasAd : true,
            mockBreakpoint : 'desktop',
            userFeatures : false
            },
            {
            adBlocker : true,
            alreadyVisited : 10,
            switch : false,
            mockhasAd : true,
            mockBreakpoint : 'desktop',
            userFeatures : false
            },
            {
            adBlocker : false,
            alreadyVisited : 10,
            switch : false,
            mockhasAd : false,
            mockBreakpoint : 'desktop',
            userFeatures: false
            },
            {
            adBlocker : true,
            alreadyVisited : 10,
            switch : true,
            mockhasAd : true,
            mockBreakpoint : 'desktop',
            userFeatures : true
            },
            {
            adBlocker : true,
            alreadyVisited : 10,
            switch : true,
            mockhasAd : true,
            mockBreakpoint : 'desktop',
            userFeatures : false
            }
        ];

        var adblockMessage, detect, mockBreakpoint;

        beforeEach(function (done) {

            injector.mock('commercial/modules/user-features', {isPayingMember : function(){
                return settings[counter].userFeatures;
            }
            });

            config.switches.adblock = settings[counter].switch;
            window.guardian.adBlockers.active = settings[counter].adBlocker;
            storage.localStorage.set('gu.alreadyVisited', settings[counter].alreadyVisited);
            mockBreakpoint = settings[counter].mockBreakpoint;


            injector.require([
                'common/modules/commercial/adblock-messages',
                'lib/detect'
            ], function () {
                adblockMessage = arguments[0];
                detect = arguments[1];

                detect.getBreakpoint = function () {
                    return mockBreakpoint;
                };
                done();
            });
        });

        afterEach(function () {
            counter += 1;
        });

        it('should not show adblock messages for the first time users', function (done) {
            adblockMessage.noAdblockMsg().then(function(boolean){
              expect(boolean).toBe(true);
            }).then(done);
        });

        it('should not show adblock messages when the adblock switch is off', function (done) {
            adblockMessage.noAdblockMsg().then(function(boolean){
                expect(boolean).toBe(true);
            }).then(done);
        });

        it('should not show adblock messages for non adblock users', function (done) {
            adblockMessage.showAdblockMsg().then(function(boolean){
                expect(boolean).toBe(false);
            }).then(done);
        });

        it('should not show adblock messages for paying members', function (done) {
            adblockMessage.noAdblockMsg().then(function(boolean){
                expect(boolean).toBe(true);
            }).then(done);
        });

        it('should show adblock messages for non paying members', function (done) {
            adblockMessage.showAdblockMsg().then(function (boolean){
                expect(boolean).toBe(true);
            }).then(done);
        });
    });
});
