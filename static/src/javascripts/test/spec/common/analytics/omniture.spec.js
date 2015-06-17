import Injector from 'helpers/injector';
import sinon from 'sinonjs';
import jasmineSinon from 'jasmine-sinon';

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
        injector.test([
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
                apl: function () {},
                Util: { getQueryParam: function () { return 'test'; } },
                getValOnce: function () { return 'test'; },
                getTimeParting: function () { return ['4:03PM', '4:00PM', 'Thursday', 'Weekday']; },
                getParamValue: function() { return ''; }
            };
            sinon.spy(s, 't');
            sinon.spy(s, 'tl');
            sinon.spy(s, 'apl');

            omniture.s = s;
            omniture.addHandlers();
            done();
        });
    });

    afterEach(function(){
        sessionStorage.removeItem('gu.analytics.referrerVars');
        mediator.removeEvent('module:clickstream:interaction');
        mediator.removeEvent('module:clickstream:click');
        mediator.removeEvent('module:analytics:omniture:pageview:sent');
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

        expect(s.linkTrackVars).toBe('channel,prop2,prop3,prop4,prop8,prop9,prop10,prop13,prop25,prop31,prop37,prop47,prop51,prop61,prop64,prop65,prop74,eVar7,eVar37,eVar38,eVar39,eVar50,events');
        expect(s.linkTrackEvents).toBe('event37');
        expect(s.events).toBe('event37');
    });

    it('should correctly set page properties', function () {
        config.page = {
            omnitureAccount: 'the_account',
            webTitle: 'a really long title a really long title a really long title a really long title a really long title a really long title ',
            contentType: 'Article',
            pageCode: '12345',
            section: 'theworld',
            keywords: 'Syria,Yemen,Egypt,Bahrain',
            author: 'Brian Whitaker,Haroon Siddique',
            tones: 'Minute by minutes,News,Blogposts',
            series: 'The Fiver',
            blogs: 'Middle East Live',
            edition: 'US',
            webPublicationDate: '2012-02-22T16:58:00.000Z',
            analyticsName: 'GFE:theworld:a-really-long-title-a-really-long-title-a-really-long-title-a-really-long',
            inBodyInternalLinkCount: '7',
            inBodyExternalLinkCount: '0'
        };
        s.linkInternalFilters = 'guardian.co.uk,guardiannews.co.uk';
        omniture.go();

        expect(s.linkInternalFilters).toBe('guardian.co.uk,guardiannews.co.uk,localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com');
        expect(s.pageName).toBe('GFE:theworld:a-really-long-title-a-really-long-title-a-really-long-title-a-really-long');
        expect(s.eVar1).toMatch('\\d\\d\\d\\d/\\d\\d/\\d\\d');  // in reality todays date e.g. 2014/05/21
        expect(s.prop9).toBe('Article');
        expect(s.channel).toBe('theworld');
        expect(s.prop4).toBe('Syria,Yemen,Egypt,Bahrain');
        expect(s.prop6).toBe('Brian Whitaker,Haroon Siddique');
        expect(s.prop8).toBe('12345');
        expect(s.prop10).toBe('Minute by minutes,News,Blogposts');
        expect(s.prop13).toBe('The Fiver');
        expect(s.prop25).toBe('Middle East Live');
        expect(s.prop47).toBe('US');
        expect(s.prop58).toBe('7');
        expect(s.prop69).toBe('0');
        expect(s.prop56).toBe('Javascript');
        expect(s.prop30).toBe('content');
        expect(s.prop19).toBe('frontend');
        expect(s.prop67).toBe('nextgen-served');
        expect(s.prop19).toBe('frontend');
        expect(s.eVar50).toBe('test');
        expect(s.cookieDomainPeriods).toBe('2');
        expect(s.trackingServer).toBe('hits.theguardian.com');
        expect(s.trackingServerSecure).toBe('hits-secure.theguardian.com');
    });

    it('should correctly set cookieDomainPeriods for UK edition', function () {
        s.linkInternalFilters = 'guardian.co.uk,guardiannews.co.uk';
        omniture.go();

        expect(s.cookieDomainPeriods).toBe('2');
    });

    it('should log a page view event', function () {
        omniture.go();

        expect(s.t).toHaveBeenCalledOnce();
    });

    it('should send event46 when a page has comments', function () {
        omniture.go();

        expect(s.apl).toHaveBeenCalled();
        expect(s.apl.args[0][1]).toBe('event46');
    });

    it('should log a clickstream event', function () {
        var clickSpec = {
                target: document.documentElement,
                samePage: true,
                sameHost: true,
                validTarget: true
            };

        omniture.go();
        mediator.emit('module:clickstream:click', clickSpec);

        expect(s.tl).toHaveBeenCalledOnce();
    });

    it('should not log clickstream events with an invalidTarget', function () {
        var clickSpec = {
            target: document.documentElement,
            validTarget: false
        };

        omniture.go();
        mediator.emit('module:clickstream:click', clickSpec);

        expect(s.tl.callCount).toBe(0);
    });

    it('should make a non-delayed s.tl call for same-page links', function () {
        var el                = document.createElement('a'),
            clickSpecSamePage = {
                target: el,
                samePage: true,
                sameHost: true,
                validTarget: true,
                tag: 'tag'
            };
        omniture.go();
        // same page  (non-delayed s.tl call)
        mediator.emit('module:clickstream:click', clickSpecSamePage);

        expect(s.tl.withArgs(true, 'o', 'tag')).toHaveBeenCalledOnce();
    });

    it('should use local storage for same-host links', function () {
        var el        = document.createElement('a'),
            clickSpec = {
                target: el,
                samePage: false,
                sameHost: true,
                validTarget: true,
                tag: 'tag in localstorage'
            };

        omniture.go();
        mediator.emit('module:clickstream:click', clickSpec);

        expect(JSON.parse(sessionStorage.getItem('gu.analytics.referrerVars')).value.tag).toEqual('tag in localstorage');
    });

    it('should make a delayed s.tl call for other-host links', function () {
        var el        = document.createElement('a'),
            clickSpec = {
                target: el,
                samePage: false,
                sameHost: false,
                validTarget: true,
                tag: 'tag'
            };

        omniture.go();
        mediator.emit('module:clickstream:click', clickSpec);

        expect(s.tl.withArgs(el, 'o', 'tag')).toHaveBeenCalledOnce();
    });
 });
