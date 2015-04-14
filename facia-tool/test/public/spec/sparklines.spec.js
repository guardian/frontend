define([
    'underscore',
    'knockout',
    'sinon',
    'modules/vars',
    'mock/histogram',
    'mock/front-widget',
    'utils/mediator',
    'utils/sparklines'
], function (
    _,
    ko,
    sinon,
    vars,
    mockHistogram,
    mockFrontWidget,
    mediator,
    sparklines
) {
    describe('Sparklines', function () {
        var originalsparksBatchQueue = vars.CONST.sparksBatchQueue;
        var originalsparksRefreshMs = vars.CONST.sparksRefreshMs;
        beforeEach(function () {
            setUpMockRequest();
            if (!vars.model) {
                vars.setModel({
                    switches: ko.observable({})
                });
            }
            var switches = vars.model.switches();
            switches['facia-tool-sparklines'] = true;
            vars.model.switches(switches);
        });
        afterEach(function () {
            vars.CONST.sparksBatchQueue = originalsparksBatchQueue;
            vars.CONST.sparksRefreshMs = originalsparksRefreshMs;
            var switches = vars.model.switches();
            switches['facia-tool-sparklines'] = false;
            vars.model.switches(switches);
        });

        it('loads sparklines for a front', function (done) {
            // Load an empty front
            var front = mockFrontWidget(null),
                onResolve = sinon.spy(),
                onReject = sinon.spy(),
                container = inject(front),
                finishTest = function () {
                    sparklines.unsubscribe(front);
                    container.remove();
                    done();
                };

            sparklines.subscribe(front);

            // Switch to a front with sparklines
            front._load('spark/front', {
                collectionOne: [
                    { article: '/article/one/web/url' },
                    { article: '/article/two/web/url' },
                    { snap: 'snapID'}
                ],
                collectionTwo: [
                    { snap: 'another/snap' }
                ],
                empty: [],
                oneArticle: [
                    { article: '/article/three/web/url' }
                ]
            });

            front.sparklines.promise.then(onResolve, onReject);

            expect(onResolve.called).toBe(false);
            expect(onReject.called).toBe(false);

            front._resolveCollection('collectionOne');
            front._resolveCollection('collectionTwo');
            front._resolveCollection('oneArticle');

            // There's still a collection pending, even if empty
            expect(onResolve.called).toBe(false);
            expect(onReject.called).toBe(false);
            front._resolveCollection('empty');

            mediator.once('mock:histogram', function () {
                expect(onResolve.called).toBe(true);
                expect(onReject.called).toBe(false);
                var resolvedObject = onResolve.args[0][0];
                expect(resolvedObject['/article/one/web/url'].series[0].data[0].count = 50);
                expect(resolvedObject['/article/two/web/url'].series[0].data[0].count = 5000);
                expectSparklinesOn(['_article_one_web_url', '_article_two_web_url']);

                // Load another front
                front._load('spark/another', {
                    onlyCollection: [{
                        // Note that it's the same article but different referring-path
                        article: '/article/one/web/url'
                    }, {
                        article: '/fancy-url'
                    }]
                });

                onResolve = sinon.spy();
                onReject = sinon.spy();
                front.sparklines.promise.then(onResolve, onReject);

                expect(onResolve.called).toBe(false);
                expect(onReject.called).toBe(false);

                front._resolveCollection('onlyCollection');

                mediator.once('mock:histogram', function () {
                    expect(onResolve.called).toBe(true);
                    expect(onReject.called).toBe(false);
                    var resolvedObject = onResolve.args[0][0];
                    expect(resolvedObject['/article/one/web/url'].series[0].data[0].count = 100);
                    expect(resolvedObject['/article/one/web/url'].series[0].data[2].count = 2000);
                    expectSparklinesOn(['_article_one_web_url', '_fancy-url']);

                    finishTest();
                });
            });
        });

        it('handles changing fronts while loading collections', function (done) {
            vars.CONST.sparksBatchQueue = 5;

            var front = mockFrontWidget('short/front', {
                    one: [{ article: '/article/one' }]
                }),
                onResolveFirst = sinon.spy(),
                onRejectFirst = sinon.spy(),
                onResolveSecond = sinon.spy(),
                onRejectSecond = sinon.spy(),
                container = inject(front),
                finishTest = function () {
                    sparklines.unsubscribe(front);
                    container.remove();
                    done();
                };
            sparklines.subscribe(front);
            front.sparklines.promise.then(onResolveFirst, onRejectFirst);

            // Switch front while we're still waiting for loading
            front._load('long/front', {
                two: [
                    { article: '/a' },
                    { article: '/b' },
                    { article: '/c' },
                    { article: '/d' },
                    { article: '/e' },
                    { article: '/f' }
                ]
            });
            front.sparklines.promise.then(onResolveSecond, onRejectSecond);

            front._resolveCollection('one');
            front._resolveCollection('two');

            // I expect two requests sent
            var continueTest = _.after(2, function () {
                expect(onResolveFirst.called).toBe(false);
                expect(onRejectFirst.called).toBe(true);
                expect(onResolveSecond.called).toBe(true);
                expect(onRejectSecond.called).toBe(false);
                expectSparklinesOn(['_a', '_b', '_c', '_d', '_e', '_f']);

                finishTest();
            });
            mediator.once('mock:histogram', function () {
                // After the first request, update the mock for the second
                mockHistogram.update({
                    '/long/front': [{
                        path: '/f',
                        series: [{ name: 'pageview', data: [{count: 10}]}],
                        totalHits: 10
                    }]
                });
                mediator.once('mock:histogram', continueTest);
                continueTest();
            });
        });

        it('handles changing fronts while loading sparklines', function (done) {
            vars.CONST.sparksBatchQueue = 5;

            var front = mockFrontWidget('long/front', {
                    two: [
                        { article: '/a' },
                        { article: '/b' },
                        { article: '/c' },
                        { article: '/d' },
                        { article: '/e' },
                        { article: '/f' }
                    ]
                }),
                onResolveFirst = sinon.spy(),
                onRejectFirst = sinon.spy(),
                onResolveSecond = sinon.spy(),
                onRejectSecond = sinon.spy(),
                container = inject(front),
                finishTest = function () {
                    sparklines.unsubscribe(front);
                    container.remove();
                    done();
                };
            sparklines.subscribe(front);
            front.sparklines.promise.then(onResolveFirst, onRejectFirst);
            front._resolveCollection('two');

            mediator.once('mock:histogram', function () {
                // After the first request, update the mock for the second, but change front
                mockHistogram.update({
                    '/long/front': [{
                        path: '/f',
                        series: [{ name: 'pageview', data: [{count: 10}]}],
                        totalHits: 10
                    }]
                });
                front._load('spark/another', {
                    one: [{ article: '/fancy-url' }]
                });
                front.sparklines.promise.then(onResolveSecond, onRejectSecond);
                mediator.once('mock:histogram', function () {
                    front._resolveCollection('one');

                    mediator.once('mock:histogram', function () {
                        expect(onResolveFirst.called).toBe(false);
                        expect(onRejectFirst.called).toBe(true);
                        expect(onResolveSecond.called).toBe(true);
                        expect(onRejectSecond.called).toBe(false);
                        expectSparklinesOn(['_fancy-url']);

                        finishTest();
                    });
                });
            });
        });

        it('loads sparklines on multiple fronts and polls', function (done) {
            vars.CONST.sparksRefreshMs = 2000;
            jasmine.clock().install();

            var frontOne = mockFrontWidget('first', {
                    one: [{ article: '/a' }]
                }),
                frontTwo = mockFrontWidget('second', {
                    two: [{ article: '/b' }]
                }),
                onResolveOne = sinon.spy(),
                onResolveTwo = sinon.spy(),
                containerOne = inject(frontOne),
                containerTwo = inject(frontTwo),
                finishTest = function () {
                    sparklines.unsubscribe(frontOne);
                    sparklines.unsubscribe(frontTwo);
                    containerOne.remove();
                    containerTwo.remove();
                    jasmine.clock().uninstall();
                    done();
                };
            sparklines.subscribe(frontOne);
            sparklines.subscribe(frontTwo);
            frontOne.sparklines.promise.then(onResolveOne);
            frontOne._resolveCollection('one');
            frontTwo.sparklines.promise.then(onResolveTwo);
            frontTwo._resolveCollection('two');

            var continueTest = _.after(2, function () {
                mediator.off('mock:histogram', continueTest);
                expect(onResolveOne.called).toBe(true);
                expect(onResolveTwo.called).toBe(true);
                expectSparklinesOn(['_a', '_b']);

                // For the next set timeout, change the mock data and verify that next request
                // contains the correct data
                mockHistogram.update({
                    '/first': [{
                        path: '/a',
                        series: [{ name: 'pageview', data: [{count: 500}]}],
                        totalHits: 500
                    }],
                    '/second': [{
                        path: '/b',
                        series: [{ name: 'pageview', data: [{count: 12345}]}],
                        totalHits: 12345
                    }]
                });
                var afterInterval = _.after(2, function () {
                    mediator.off('mock:histogram', afterInterval);
                    expect(sparklinesTitle('_a')).toBe('500');
                    expect(sparklinesTitle('_b')).toBe('12,345');

                    finishTest();
                });
                mediator.on('mock:histogram', afterInterval);

                jasmine.clock().tick(3000);
            });
            mediator.on('mock:histogram', continueTest);

            // Advance time to get the mocked response
            jasmine.clock().tick(100);
        });

        it('refreshes when the collection changes', function (done) {
            vars.CONST.sparksRefreshMs = 2000;
            jasmine.clock().install();

            var front = mockFrontWidget('first', {
                    one: [{ article: '/a' }]
                }),
                container = inject(front),
                finishTest = function () {
                    sparklines.unsubscribe(front);
                    container.remove();
                    jasmine.clock().uninstall();
                    done();
                };
            sparklines.subscribe(front);
            front._resolveCollection('one');

            mediator.once('mock:histogram', function () {
                expectSparklinesOn(['_a']);
                expect(sparklinesTitle('_a')).toBe('100');

                // Change the data, however note that articles already displayed shouldn't refresh
                mockHistogram.update({
                    '/first': [{
                        path: '/a',
                        series: [{ name: 'pageview', data: [{count: 77}]}],
                        totalHits: 77
                    }, {
                        path: '/b',
                        series: [{ name: 'pageview', data: [{count: 200}]}],
                        totalHits: 200
                    }]
                });

                // Inject a new article in the front (either dragging or collection update)
                front._addArticle('one', { article: '/b' });
                // Adding an article makes a new request for the added articles
                jasmine.clock().tick(100);

                expectSparklinesOn(['_a', '_b']);
                // Note that the old article doesn't change
                expect(sparklinesTitle('_a')).toBe('100');
                expect(sparklinesTitle('_b')).toBe('200');

                // wait a set interval and check that A is refreshed correctly
                jasmine.clock().tick(2000);
                expectSparklinesOn(['_a', '_b']);
                expect(sparklinesTitle('_a')).toBe('77');
                expect(sparklinesTitle('_b')).toBe('200');

                finishTest();
            });

            // Advance time to get the mocked response
            jasmine.clock().tick(100);
        });
    });

    function expectSparklinesOn (elements) {
        // The only way I can test sparklines is to check that highcharts generates some elements
        elements.forEach(function (className) {
            var chart = $('.' + className).next('.test-chart');
            expect(chart.children().length).toBeGreaterThan(0);
        });
    }

    function sparklinesTitle (element) {
        return $('.' + element).next('.test-chart').find('.highcharts-title').text().trim();
    }

    function inject (model) {
        var template = $([
            '<div data-bind="foreach: collections()">',
                '<div data-bind="foreach: _items">',
                    '<div class="test-article">',
                        '<span data-bind="text: _name, css: _id"></span>',
                        '<div class="test-chart" data-bind="sparklines: true"></div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''));
        $(document.body).append(template);

        ko.applyBindings(model, template[0]);

        return template;
    }

    function waitRequest (callback, clock) {
        mediator.once('mock:histogram', function () {
            setTimeout(callback, 500);
        });
    }

    function setUpMockRequest () {
        mockHistogram.set({
            '/spark/front': [
                {
                    path: '/article/one/web/url',
                    series: [{
                        name: 'pageview',
                        data: [{count: 50}, {count: 50}, {count: 50}]
                    }],
                    totalHits: 400
                }, {
                    path: '/article/two/web/url',
                    series: [{
                        name: 'pageview',
                        data: [{count: 100}, {count: 1000}, {count: 3000}]
                    }],
                    totalHits: 5000
                }
                // note that the third article is missing... no data
            ],
            '/spark/another': [
                {
                    path: '/article/one/web/url',
                    series: [{
                        name: 'pageview',
                        data: [{count: 300}, {count: 50}, {count: 10}]
                    }],
                    totalHits: 1000
                }, {
                    path: '/fancy-url',
                    series: [{
                        name: 'pageview',
                        data: [{count: 0}, {count: 0}, {count: 2000}]
                    }],
                    totalHits: 2000
                }
            ],
            '/long/front': [
                {
                    path: '/a',
                    series: [{ name: 'pageview', data: [{count: 10}]}],
                    totalHits: 10
                }, {
                    path: '/b',
                    series: [{ name: 'pageview', data: [{count: 10}]}],
                    totalHits: 10
                }, {
                    path: '/c',
                    series: [{ name: 'pageview', data: [{count: 10}]}],
                    totalHits: 10
                }, {
                    path: '/d',
                    series: [{ name: 'pageview', data: [{count: 10}]}],
                    totalHits: 10
                }, {
                    path: '/e',
                    series: [{ name: 'pageview', data: [{count: 10}]}],
                    totalHits: 10
                }
                // Note that /f is added later by the test
            ],
            '/first': [
                {
                    path: '/a',
                    series: [{ name: 'pageview', data: [{count: 100}]}],
                    totalHits: 100
                }
            ],
            '/second': [
                {
                    path: '/b',
                    series: [{ name: 'pageview', data: [{count: 200}]}],
                    totalHits: 200
                }
            ]
        });
    }
});
