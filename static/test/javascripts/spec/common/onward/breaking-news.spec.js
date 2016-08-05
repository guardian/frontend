/*eslint no-console: 0*/
define([
    'helpers/injector',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/storage',
    'lodash/objects/defaults',
    'Promise'
], function (
    Injector,
    $,
    config,
    fetchJson,
    storage,
    defaults,
    Promise
) {
    describe('Breaking news', function () {
        var injector = new Injector(),
            breakingNewsURL = '/news-alert/alerts',
            knownAlertIDsStorageKey = 'gu.breaking-news.hidden',
            server;

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
            return new Promise(function (resolve, reject) {
                injector.mock({
                    'common/utils/storage': storage,
                    'common/utils/fetch-json': fetchJson
                }).require(['common/modules/onward/breaking-news'], function (breakingNews) {
                    breakingNews.DEFAULT_DELAY = 100;
                    server = sinon.fakeServer.create();
                    server.respondImmediately = true;
                    server.autoRespond = true;
                    server.respondWith(breakingNewsURL, [200, {'Content-Type': 'application/json'}, JSON.stringify({
                        webTitle: 'Breaking News',
                        collections: collections
                    })]);
                    Promise.resolve().then(function () {
                        return breakingNews();
                    }).then(function(result) {
                        // make sure the DOM has finished updating
                        setTimeout(function () {
                            resolve(result);
                        }, 20);
                    }).catch(reject).then(function () {
                        server.restore();
                    });
                }, function (e) {
                    console.log(e);
                });
            });
        }

        beforeAll(function () {
            fetchJson = jasmine.createSpy().and.callFake(fetchJson);
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
                    expect(res).toEqual('cannot dismiss');
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
    });
});
