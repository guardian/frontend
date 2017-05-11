/*eslint no-console: 0*/
define([
    'helpers/injector',
    'lib/$',
    'lib/config',
    'lib/storage',
    'lodash/objects/defaults'
], function (
    Injector,
    $,
    config,
    storage,
    defaults
) {
    describe('Breaking news', function () {
        var injector = new Injector(),
            knownAlertIDsStorageKey = 'gu.breaking-news.hidden',
            fetchJson;

        function alertThatIs(type, options) {
            options = defaults(options || {}, {
                collection: 'uk',
                age: 1
            });
            var sAge = options.age !== 1 ? options.age + 'min ' : '';
            return {
                href: options.collection,
                content: [{
                    headline: sAge + options.collection + ' ' + type + ' headline',
                    trailText: options.collection + ' ' + type + ' trailText',
                    id: options.collection + '_' + type,
                    frontPublicationDate: Date.now() - (1000 * 60 * options.age)
                }]
            };
        }

        function mockBreakingNewsWith(collections) {
            fetchJson.and.callFake(function() {
                return Promise.resolve({
                        webTitle: 'Breaking News',
                        collections: collections
                    });
                });

            return new Promise(function (resolve, reject) {
                var fakeSvgs = {
                    inlineSvg: function() {
                        return '';
                    }
                };

                injector.mock({
                    'lib/storage': storage,
                    'lib/fetch-json': fetchJson,
                    'common/views/svgs': fakeSvgs
                }).require(['common/modules/onward/breaking-news'], function (breakingNews) {
                    breakingNews.DEFAULT_DELAY = 100;
                    Promise.resolve().then(function () {
                        return breakingNews();
                    }).then(function(result) {
                        // make sure the DOM has finished updating
                        setTimeout(function () {
                            resolve(result);
                        }, 30);
                    }).catch(reject);
                }, function (e) {
                    console.log(e);
                });
            });
        }

        beforeAll(function () {
            fetchJson = jasmine.createSpy('fetch-json');
            config.page.edition = 'UK';
        });

        beforeEach(function (done) {
            $('body').html('<div class="js-breaking-news-placeholder breaking-news breaking-news--hidden breaking-news--fade-in" data-link-name="breaking news" data-component="breaking-news"></div>');
            requestAnimationFrame(done);
        });
        afterEach(function (done) {
            $('.js-breaking-news-placeholder').remove();
            requestAnimationFrame(done);
        });

        describe('user cannot dismiss alerts', function () {
            beforeEach(function () {
                sinon.stub(storage.local, 'isAvailable').returns(false);
            });

            it('should not try and fetch the json', function (done) {
                mockBreakingNewsWith([]).then(function () {
                    done.fail('user cannot use local storage, but we seem to think things are okish');
                }, function (res) {
                    expect(fetchJson).not.toHaveBeenCalled();
                    expect(res.message).toEqual('cannot dismiss');
                    expect($('.js-breaking-news-placeholder:not(:empty)').length).toBe(0);
                }).then(done).catch(done.fail);
            });

            afterEach(function () {
                storage.local.isAvailable.restore();
            });
        });

        describe('user can dismiss alerts', function () {
            beforeEach(function () {
                storage.local.set(knownAlertIDsStorageKey, {
                    'uk_known': false,
                    'uk_dismissed': true
                });
            });

            it('should try and fetch the json', function (done) {
                mockBreakingNewsWith([]).then(function () {
                    expect(fetchJson).toHaveBeenCalled();
                }).then(done).catch(done.fail);
            });

            it('should show an unknown alert after 3 seconds and record it', function (done) {
                var collections = [
                    alertThatIs('unknown', {age: 2, collection: 'uk'})
                ];

                expect(storage.local.get(knownAlertIDsStorageKey).uk_unknown).toBeUndefined();

                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert.headline).toEqual('2min uk unknown headline');
                    expect($('.breaking-news--hidden.breaking-news--fade-in').length).toBe(1);
                    expect($('.breaking-news--spectre').length).toBe(0);

                    setTimeout(function () {
                        expect($('.breaking-news--spectre').length).toBe(1);
                        expect($('.breaking-news--hidden').length).toBe(0);
                        expect(storage.local.get(knownAlertIDsStorageKey).uk_unknown).toBe(false);
                        done();
                    }, 120);
                }).catch(done.fail);
            });

            it('should show a known alert immediately', function (done) {
                var collections = [
                    alertThatIs('known')
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert.headline).toEqual('uk known headline');
                    expect($('.breaking-news--hidden.breaking-news--fade-in').length).toBe(0);
                    expect($('.breaking-news--spectre').length).toBe(1);
                    expect($('.breaking-news--hidden').length).toBe(0);
                }).then(done).catch(done.fail);
            });

            it('should not show a dismissed alert', function (done) {
                var collections = [
                    alertThatIs('dismissed')
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert).toBeFalsy();
                    expect($('.js-breaking-news-placeholder:not(:empty)').length).toBe(0);
                }).then(done).catch(done.fail);
            });

            it('should show an alert for this edition', function (done) {
                var collections = [
                    alertThatIs('unknown', {collection: 'uk'})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert).not.toBeUndefined();
                }).then(done).catch(done.fail);
            });

            it('should not show an alert for a different edition', function (done) {
                var collections = [
                    alertThatIs('unknown', {collection: 'us'})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert).toBeUndefined();
                }).then(done).catch(done.fail);
            });

            it('should show a global alert before an edition alert', function (done) {
                var collections = [
                    alertThatIs('unknown', {collection: 'uk'}),
                    alertThatIs('unknown', {collection: 'global'})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert.headline).toEqual('global unknown headline');
                }).then(done).catch(done.fail);
            });

            it('should show an edition alert before a section alert', function (done) {
                var collections = [
                    alertThatIs('unknown', {collection: 'uk'}),
                    alertThatIs('unknown', {collection: 'football'})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert.headline).toEqual('uk unknown headline');
                }).then(done).catch(done.fail);
            });

            it('should not show an alert that is 20 mins old', function (done) {
                var collections = [
                    alertThatIs('unknown', {age: 20})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert).toBeUndefined();
                }).then(done).catch(done.fail);
            });

            it('should show an alert less than 20 mins old', function (done) {
                var collections = [
                    alertThatIs('unknown', {age: 19})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert).not.toBeUndefined();
                }).then(done).catch(done.fail);
            });

            it('should show the newest viable alert', function (done) {
                var collections = [
                    alertThatIs('unknown', {age: 5}),
                    alertThatIs('unknown', {age: 2})
                ];
                mockBreakingNewsWith(collections).then(function (alert) {
                    expect(alert.headline).toEqual('2min uk unknown headline');
                }).then(done).catch(done.fail);
            });

            it('should prune known alerts', function (done) {
                var collections = [
                    alertThatIs('known')
                ];

                expect(storage.local.get(knownAlertIDsStorageKey).uk_known).not.toBeUndefined();
                expect(storage.local.get(knownAlertIDsStorageKey).uk_dismissed).not.toBeUndefined();

                mockBreakingNewsWith(collections).then(function () {
                    expect(storage.local.get(knownAlertIDsStorageKey).uk_known).not.toBeUndefined();
                    expect(storage.local.get(knownAlertIDsStorageKey).uk_dismissed).toBeUndefined();
                }).then(done).catch(done.fail);
            });
        });

        describe('banner emits ready events', function () {

            var mediator;

            beforeEach(function (done) {
                injector.require([
                    'lib/mediator'
                ], function () {
                    mediator = arguments[0];
                    done();
                }, function () {
                    done();
                });
            });

            afterEach(function () {
                mediator.removeAllListeners();
            });

            it('should pass false when banner will not show', function (done) {

                mediator.on('modules:onwards:breaking-news:ready', function (breakingShown) {
                    expect(breakingShown).toBe(false);
                    done();
                })

                mockBreakingNewsWith([]).catch(done.fail);

            });

            it('should pass true when banner will show', function (done) {

                mediator.on('modules:onwards:breaking-news:ready', function (breakingShown) {
                    expect(breakingShown).toBe(true);
                    done();
                })

                var collections = [
                    alertThatIs('unknown', {age: 2, collection: 'uk'})
                ];

                mockBreakingNewsWith(collections).catch(done.fail);

            });
        });
    });
});
