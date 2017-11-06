define([
    'helpers/injector'
], function (Injector) {

    describe('Football', function () {
        var injector = new Injector();
        var sut;
        var sandbox = sinon.sandbox.create();
        var destroySpy = sandbox.spy();
        
        function mockMatchListLive() {}

        mockMatchListLive.prototype.destroy = destroySpy;
        
        beforeEach(function (done) {
            document.body.innerHTML = '<img class="media-primary"></img><div class="js-football-meta"></div>';

            injector.mock('lib/config', {
                dateFromSlug: sandbox.spy()
            });

            injector.mock('bean', {
                on: sandbox.spy()
            });

            injector.mock({
                'common/modules/sport/football/tag-page-stats': {
                    tagPageStats: sandbox.spy()
                },
                'common/modules/sport/football/match-list-live': {
                    MatchListLive: mockMatchListLive
                },
                'lib/page': {
                    isMatch: sandbox.spy(),
                    isCompetition: sandbox.spy(),
                    isLiveClockwatch: function (cb) {
                        cb();
                    },
                    isFootballStatsPage: sandbox.spy()
                }
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
            
            it('handles successful fetch request', function () {
                fetchSpy = sandbox.spy(function(elem) {
                    addFootballElem(elem);
                    return {
                        then: function(cb) {
                            cb();
                            return this;
                        },
                        catch: function() {
                        }
                    };
                });

                mockMatchListLive.prototype.fetch = fetchSpy;

                sut.init();
            });

            it('handles failed fetch request', function () {
                fetchSpy = sandbox.spy(function(elem) {
                    addFootballElem(elem);
                    return {
                        then: function() {
                            return this;
                        },
                        catch: function(cb) {
                            cb();
                        }
                    };
                });

                mockMatchListLive.prototype.fetch = fetchSpy;

                sut.init();
            });
        });
    });
});
