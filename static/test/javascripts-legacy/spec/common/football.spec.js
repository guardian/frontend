define([
    'helpers/injector'
], function (Injector) {

    describe('Football', function () {
        var injector = new Injector();
        var sut;
        var sandbox;
    
        beforeEach(function (done) {
            sandbox = sinon.sandbox.create();

            injector.mock('lib/page', {
                isMatch: sandbox.spy(),
                isCompetition: sandbox.spy(),
                isLiveClockwatch: function (cb) {
                    console.log('***', cb);
                    // cb();
                },
                isFootballStatsPage: sandbox.spy()
            });

            injector.require([
                'bootstraps/enhanced/football'
            ], function (football) {
                sut = football;
                done();
            },
            done.fail);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('isLiveClockwatch', function () {
            sut.init();
        });
    });
});
