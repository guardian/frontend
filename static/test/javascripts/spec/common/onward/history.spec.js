define([
    'common/utils/storage',
    'common/modules/onward/history',
    'fixtures/history/contains',
    'fixtures/history/max'
], function (
    storage,
    hist,
    contains,
    max
) {
    var today =  Math.floor(Date.now() / 86400000); // 1 day in ms

    var pageConfig = {
            pageId: '/p/3jbcb',

            section: 'foobar',
            sectionName: 'Foobar Section',

            keywordIds: 'foo/bar,baz/poo',
            keywords: 'Foobar Tag,Bazpoo Tag',

            seriesId: 'foo/series/bar',
            series: 'Foobar Series',

            authorIds: 'profile/finbarrsaunders,profile/rogermellie',
            author: 'Finbarr Saunders, Roger Mellie'
        },
        oftenVisited = {
            pageId: '123',
            section: 'often/visited',
            sectionName: 'Often Visited Section'
        },
        lessVisited = {
            pageId: '456',
            section: 'less/visited',
            sectionName: 'Less Visited Section'
        };

    describe('History', function () {

        beforeEach(function () {
            hist.reset();
            storage.local.set('gu.history', contains);
        });

        it('should get history from local storage', function () {
            expect(hist.test.getHistory()).toEqual(contains);
        });

        it('should set history to local storage', function () {
            hist.logHistory(pageConfig);

            expect(hist.test.getHistory()[0][0]).toEqual(pageConfig.pageId);
        });

        it('should set the count of entries', function () {
            hist.logHistory(pageConfig);
            expect(hist.test.getHistory()[0][1]).toEqual(1);

            hist.logHistory(pageConfig);
            expect(hist.test.getHistory()[0][1]).toEqual(2);
        });

        it('should only store 50 latest entries', function () {
            storage.local.set('gu.history', max);
            hist.logHistory(pageConfig);

            expect(hist.test.getHistory().length).toEqual(50);
        });

        it('should increment a count in the summary, for the 1st value from each of various page metadata', function () {
            hist.logSummary(pageConfig);

            /*eslint-disable dot-notation*//*jscs:disable requireDotNotation*/
            expect(hist.test.getSummary().tags['foobar'][0]).toEqual('Foobar Section');
            expect(hist.test.getSummary().tags['foobar'][1][0][1]).toEqual(1);
            /*eslint-enable dot-notation*//*jscs:enable requireDotNotation*/

            expect(hist.test.getSummary().tags['foo/bar'][0]).toEqual('Foobar Tag');
            expect(hist.test.getSummary().tags['foo/bar'][1][0][1]).toEqual(1);
            expect(hist.test.getSummary().tags['baz/poo']).toBeUndefined();

            expect(hist.test.getSummary().tags['foo/series/bar'][0]).toEqual('Foobar Series');
            expect(hist.test.getSummary().tags['foo/series/bar'][1][0][1]).toEqual(1);

            expect(hist.test.getSummary().tags['profile/finbarrsaunders'][0]).toEqual('Finbarr Saunders');
            expect(hist.test.getSummary().tags['profile/finbarrsaunders'][1][0][1]).toEqual(1);
            expect(hist.test.getSummary().tags['profile/rogermellie']).toBeUndefined();

            hist.logSummary(pageConfig);
            hist.logSummary(pageConfig);

            /*eslint-disable dot-notation*//*jscs:disable requireDotNotation*/
            expect(hist.test.getSummary().tags['foobar'][0]).toEqual('Foobar Section');
            expect(hist.test.getSummary().tags['foobar'][1][0][1]).toEqual(3);
            /*eslint-enable dot-notation*//*jscs:enable requireDotNotation*/
        });

        it('should age the data points in the the summary', function () {
            /*eslint-disable dot-notation*//*jscs:disable requireDotNotation*/
            expect(
                hist.test.pruneSummary({
                    periodEnd: today,
                    tags: {foo: ['Foo', [[0, 1]]]}
                })
                .tags['foo'][1][0][0]
            ).toEqual(0);

            expect(
                hist.test.pruneSummary({
                    periodEnd: today - 5,
                    tags: {foo: ['Foo', [[0, 1]]]}
                })
                .tags['foo'][1][0][0]
            ).toEqual(5);
            /*eslint-enable dot-notation*//*jscs:enable requireDotNotation*/
        });

        it('should drop the obsoleted data points from the summary', function () {
            /*eslint-disable dot-notation*//*jscs:disable requireDotNotation*/
            expect(
                hist.test.pruneSummary({
                    periodEnd: today - 500,
                    tags: {foo: ['Foo', [[0, 1]]]}
                })
                .tags['foo']
            ).toBeUndefined();
            /*eslint-enable dot-notation*//*jscs:enable requireDotNotation*/
        });

        it('should return equally visited items in last-in-first-out order', function () {
            hist.logSummary(oftenVisited, today);
            hist.logSummary(lessVisited,  today);

            hist.logSummary(oftenVisited, today + 1);
            hist.logSummary(lessVisited,  today + 1);

            hist.logSummary(oftenVisited, today + 2);
            hist.logSummary(lessVisited,  today + 2);

            expect(
                hist.getPopular()[0][0]
            ).toEqual('less/visited');

            expect(
                hist.getPopular()[1][0]
            ).toEqual('often/visited');
        });

        it('should return most visited items first', function () {
            hist.logSummary(oftenVisited, today);
            hist.logSummary(oftenVisited, today);
            hist.logSummary(lessVisited,  today);

            hist.logSummary(oftenVisited, today + 1);
            hist.logSummary(lessVisited,  today + 1);

            hist.logSummary(oftenVisited, today + 2);
            hist.logSummary(lessVisited,  today + 2);


            expect(
                hist.getPopular()[0][0]
            ).toEqual('often/visited');

            expect(
                hist.getPopular()[1][0]
            ).toEqual('less/visited');
        });
    });
});
