define([
    'helpers/injector'
], function (
    Injector
) {
    describe('omniture', function () {

        var config = {
            page: { },
            switches: { },
            tests: []
        };
        var s, omniture, mediator,
            injector = new Injector();

        injector.mock('common/utils/config', config);

        beforeEach(function (done) {
            injector.require([
                'common/modules/analytics/omniture',
                'common/utils/mediator'], function () {

                    omniture = arguments[0];
                    mediator = arguments[1];


                    config.page = {
                        analyticsName:   'the_page_name',
                        beaconUrl:       '',
                        contentType:     'Article',
                        commentable:     true,
                        edition:         'NOT-US',
                        omnitureAccount: 'the_account'
                    };

                    s = {
                        t: function () {},
                        tl: function () {},
                        apl: function (x, y, z) {
                            return [x, y]
                                .filter(function (a) {
                                    return a;
                                })
                                .join(z);
                        },
                        Util: { getQueryParam: function () { return 'test'; } },
                        getValOnce: function () { return 'test'; },
                        getTimeParting: function () { return ['4:03PM', '4:00PM', 'Thursday', 'Weekday']; },
                        getParamValue: function () { return ''; }
                    };
                    sinon.spy(s, 't');
                    sinon.spy(s, 'tl');
                    sinon.spy(s, 'apl');

                    omniture.s = s;
                    done();
                });
        });

        afterEach(function () {
            sessionStorage.removeItem('gu.analytics.referrerVars');
            mediator.removeEvent('module:clickstream:interaction');
            mediator.removeEvent('module:clickstream:click');
        });

        it('should track clicks with correct analytics name', function () {
            s.pageType = 'article';
            omniture.go();
            omniture.trackLink('link object', 'outer:link');

            expect(s.eVar37).toBe('Article:outer:link');
            expect(s.prop37).toBe('D=v37');
            expect(s.eVar7).toBe('D=pageName');
        });

        it('should remove custom event properties after tracking', function () {
            s.pageType = 'article';
            omniture.go();
            omniture.trackLink('link object', 'outer:link', { prop74: 'foo' });

            expect(s.eVar37).toBe('Article:outer:link');
            expect(s.prop37).toBe('D=v37');
            expect(s.eVar7).toBe('D=pageName');

            expect(s.prop74).toBe(undefined);
        });

        it('should track clicks with a standardised set of variables', function () {
            s.pageType = 'article';
            omniture.go();
            omniture.trackLink('link object', 'outer:link');

            expect(s.linkTrackVars).toBe('channel,prop1,prop2,prop3,prop4,prop8,prop9,prop10,prop13,prop25,prop31,prop37,prop38,prop47,prop51,prop61,prop64,prop65,prop74,prop40,prop63,eVar7,eVar37,eVar38,eVar39,eVar50,eVar24,eVar60,eVar51,eVar31,eVar18,eVar32,eVar40,list1,list2,list3,events');
            expect(s.linkTrackEvents).toBe('event37');
            expect(s.events).toBe('event37');
        });

        it('should not track links or pageviews when initialising the omniture module', function (){
            omniture.go();
            expect(s.tl).not.toHaveBeenCalled();
            expect(s.t).not.toHaveBeenCalled();
        });

        it('should make a non-delayed s.tl call for same-page links', function () {
            var el = document.createElement('a');
            omniture.go();
            omniture.trackSamePageLinkClick(el, 'tag', {});

            expect(s.tl.withArgs(true, 'o', 'tag')).toHaveBeenCalledOnce();
        });

        it('should make a delayed s.tl call for other-host links', function () {
            var el = document.createElement('a');
            omniture.go();
            omniture.trackExternalLinkClick(el, 'tag', {});

            expect(s.tl.withArgs(el, 'o', 'tag')).toHaveBeenCalledOnce();
        });
    });
});
