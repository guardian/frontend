define([
    'helpers/injector'
], function (Injector) {

    describe('Football', function () {
        var injector = new Injector();
        var sut;
        var sandbox;
        var destroySpy;

        function mockMatchListLive() {}
        
        beforeEach(function (done) {
            document.body.innerHTML = '<img class="media-primary"></img><div class="js-football-meta"></div>';

            sandbox = sinon.sandbox.create();

            destroySpy = sandbox.spy();

            mockMatchListLive.prototype.destroy = destroySpy;

            injector.mock('lib/config', {
                dateFromSlug: sinon.spy()
            });

            injector.mock('bean', {
                on: sinon.spy()
            });

            injector.mock('common/modules/sport/football/tag-page-stats', {
                tagPageStats: sinon.spy()
            });

            injector.mock('common/modules/sport/football/match-list-live', {
                MatchListLive: mockMatchListLive
            });

            injector.mock('lib/page', {
                isMatch: sandbox.spy(),
                isCompetition: sandbox.spy(),
                isLiveClockwatch: function (cb) {
                    cb();
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
            document.body.innerHTML = '';
            sandbox.restore();
        });

        describe('isLiveClockwatch', function () {
            var fetchSpy;

            var addFootballElem = function (elem) {
                var footballMatchElem = document.createElement('div');
                
                footballMatchElem.classList.add('football-match');
                
                footballMatchElem.appendChild(elem);

                document.body.appendChild(footballMatchElem);
            };

            afterEach(function () {
                expect(fetchSpy).toHaveBeenCalled();
                expect(destroySpy).toHaveBeenCalled();
                expect(document.querySelectorAll('.football-matches__container').length).toBe(0);
                expect(document.querySelector('.media-primary').classList.contains('u-h')).toBeFalsy();
            });
            
            it('handles successful fetch request', function (done) {
                fetchSpy = sandbox.spy(function(elem) {
                    return new Promise(function (resolve) {
                        addFootballElem(elem);
                        resolve();
                    });
                });

                mockMatchListLive.prototype.fetch = fetchSpy;

                sut.init().then(function() {
                   done();
                });
            });

            it('handles failed fetch request', function (done) {
                fetchSpy = sandbox.spy(function(elem) {
                    return new Promise(function (resolve, reject) {
                        addFootballElem(elem);
                        reject();
                    });
                });

                mockMatchListLive.prototype.fetch = fetchSpy;

                sut.init().then(function() {
                    done();
                });
            });
        });
    });
});
