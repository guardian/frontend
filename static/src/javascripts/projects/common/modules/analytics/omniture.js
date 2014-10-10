define([
    'common/utils/detect',
    'common/modules/experiments/ab',
    'common/utils/storage',
    'common/modules/identity/api',
    'common/utils/cookies',
    'omniture',
    'common/modules/analytics/mvt-cookie',
    'common/modules/analytics/beacon',
    'common/utils/pad',
    'common/utils/mediator',
    'common/utils/deferToAnalytics' // Ensure that 'analytics:ready' is handled.
], function(
    detect,
    ab,
    storage,
    id,
    Cookies,
    s,
    mvtCookie,
    beacon,
    pad,
    mediator
    ) {

    // https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview

    /**
     * @param Object w 'window' object, used for testing
     */
    function Omniture(s, w) {

        var R2_STORAGE_KEY = 's_ni', // DO NOT CHANGE THIS, ITS IS SHARED WITH R2. BAD THINGS WILL HAPPEN!
            NG_STORAGE_KEY = 'gu.analytics.referrerVars',
            config,
            that = this;

        w = w || {};

        this.pageviewSent = false;

        this.logView = function() {
            s.t();
            this.confirmPageView();
        };

        this.logUpdate = function() {
            s.linkTrackVars='events,eVar7';
            s.linkTrackEvents='event90';
            s.events='event90';
            s.eVar7=config.page.analyticsName;
            s.tl(true,'o','AutoUpdate Refresh');
        };

        this.logTag = function(spec) {
            var storeObj,
                delay;

            if (!spec.tag) {
                return;
            } else if (spec.sameHost && !spec.samePage) {
                // Came from a link to a new page on the same host,
                // so do session storage rather than an omniture track.
                storeObj = {
                    pageName: s.pageName,
                    tag: spec.tag,
                    time: new Date().getTime()
                };
                try { sessionStorage.setItem(R2_STORAGE_KEY, storeObj.tag); } catch(e) {}
                storage.session.set(NG_STORAGE_KEY, storeObj);
            } else {
                that.populateEventProperties(spec.tag);
                // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
                delay = spec.samePage ? true : spec.target;
                s.tl(delay, 'o', spec.tag);
            }
        };

        this.populateEventProperties = function(tag){
            s.linkTrackVars = 'eVar37,eVar7,prop37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + tag : tag;

            // this allows 'live' Omniture tracking of Navigation Interactions
            s.eVar7 = 'D=pageName';
            s.prop37 = 'D=v37';

            if(/social/.test(tag)) {
                s.linkTrackVars += ',eVar12,prop4,prop9,prop10';
                s.linkTrackEvents += ',event16';
                s.eVar12 = tag;
                s.prop4     = config.page.keywords || '';
                s.prop9     = config.page.contentType || '';
                s.prop10    = config.page.tones || '';
                s.events = s.apl(s.events, 'event16', ',');
            }
        };

        // used where we don't have an element to pass as a tag
        // eg. keyboard interaction
        this.trackNonLinkEvent = function(tagStr) {
            s.linkTrackVars = 'eVar37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + tagStr : tagStr;
            s.tl(true, 'o', tagStr);
        };

        this.populatePageProperties = function() {

            // http://www.scribd.com/doc/42029685/15/cookieDomainPeriods
            s.cookieDomainPeriods = '2';

            s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com';

            s.trackingServer='hits.theguardian.com';
            s.trackingServerSecure='hits-secure.theguardian.com';

            s.ce= 'UTF-8';
            s.pageName  = config.page.analyticsName;

            s.prop1     = config.page.headline || '';

            // eVar1 contains today's date
            // in the Omniture backend it only ever holds the first
            // value a user gets, so in effect it is the first time
            // we saw this user
            var now = new Date();
            s.eVar1 = now.getFullYear() + '/' +
                pad(now.getMonth() + 1, 2) + '/' +
                pad(now.getDate(), 2);

            if(id.getUserFromCookie()) {
                s.prop2 = 'GUID:' + id.getUserFromCookie().id;
                s.eVar2 = 'GUID:' + id.getUserFromCookie().id;
            }

            s.prop3     = config.page.publication || '';

            s.channel = config.page.contentType === 'Network Front' ? 'Network Front' : config.page.section || '';
            s.prop9     = config.page.contentType || '';  //contentType

            s.prop4     = config.page.keywords || '';
            s.prop6     = config.page.author || '';
            s.prop7     = config.page.webPublicationDate || '';
            s.prop8     = config.page.pageCode || '';
            s.prop9     = config.page.contentType || '';
            s.prop10    = config.page.tones || '';

            s.prop13    = config.page.series || '';

            // see http://blogs.adobe.com/digitalmarketing/mobile/responsive-web-design-and-web-analytics/
            s.eVar18    = detect.getBreakpoint();
            s.eVar21    = document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight;
            s.eVar32    = detect.getOrientation();

            /* Set Time Parting Day and Hour Combination - 0 = GMT */
            var tpA = s.getTimeParting('n','+0');
            s.prop20 = tpA[2] + ':' + tpA[1];
            s.eVar20 = 'D=c20';


            s.prop25    = config.page.blogs || '';

            s.prop14    = config.page.buildNumber || '';

            s.prop60    = navigator.mozApps && !window.locationbar.visible ? 'firefoxosapp' : null;

            var platform = 'frontend';
            s.prop19     = platform;
            s.eVar19     = platform;

            s.prop31    = id.getUserFromCookie() ? 'registered user' : 'guest user';
            s.eVar31    = id.getUserFromCookie() ? 'registered user' : 'guest user';

            s.prop47    = config.page.edition || '';

            var mvt = ab.makeOmnitureTag(config, document);

            s.prop51  = mvt;
            s.eVar51  = mvt;

            // cookie used for user migration
            var gu_shift = Cookies.get('GU_SHIFT');
            if (gu_shift) {
                var shiftValue = 'gu_shift,' + gu_shift + ',';
                var gu_view = Cookies.get('GU_VIEW');

                if (gu_view) {
                    shiftValue += ',' + gu_view;
                }

                s.prop51  = shiftValue + s.prop51;
                s.eVar51  = shiftValue + s.eVar51;
            }

            if (s.prop51) {
                s.events = s.apl(s.events,'event58',',');
            }

            // Tag the identity of this user, which is composed of
            // the omniture visitor id, the ophan browser id, and the frontend-only mvt id.
            var mvtId = mvtCookie.getMvtFullId();

            if (mvtId) {
                s.eVar60 = mvtId;
            }

            if (config.page.commentable) {
                s.events = s.apl(s.events,'event46',',');
            }

            if (config.page.section === 'identity')  {
                s.prop11 = 'Users';
                s.prop9 = 'userid';
                s.eVar27 = config.page.omnitureErrorMessage || '';
                s.eVar42 = config.page.returnUrl || '';
                s.hier2='GU/Users/Registration';
                s.events = s.apl(s.events, config.page.omnitureEvent, ',');
            }

            s.prop56    = 'Javascript';

            // not all pages have a production office
            if (config.page.productionOffice) {
                s.prop64 = config.page.productionOffice;
            }

            /* Omniture library version */
            s.prop62 = "Guardian JS-1.4.1 20140914";

            s.prop63    = detect.getPageSpeed();

            s.prop65    = config.page.headline || '';

            s.prop67    = 'nextgen-served';

            s.prop68    = detect.getConnectionSpeed(w.performance, null, true);

            if (config.page.webPublicationDate) {
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }

            if(s.Util.getQueryParam('INTCMP') !== '') {
                s.eVar50 = s.Util.getQueryParam('INTCMP');
            }
            s.eVar50 = s.getValOnce(s.eVar50,'s_intcampaign', 0);

            // the operating system
            s.eVar58 = navigator.platform || 'unknown';

            // the number of Guardian links inside the body
            if (config.page.inBodyInternalLinkCount) {
                s.prop58 = config.page.inBodyInternalLinkCount;
            }

            // the number of External links inside the body
            if (config.page.inBodyExternalLinkCount) {
                s.prop69 = config.page.inBodyExternalLinkCount;
            }

            /* Retrieve navigation interaction data */
            var ni = storage.session.get(NG_STORAGE_KEY);
            if (ni) {
                var d = new Date().getTime();
                if (d - ni.time < 60 * 1000) { // One minute
                    s.eVar24 = ni.pageName;
                    s.eVar37 = ni.tag;
                    s.events = 'event37';

                    // this allows 'live' Omniture tracking of Navigation Interactions
                    s.eVar7 = ni.pageName;
                    s.prop37 = ni.tag;
                }
                storage.session.remove(R2_STORAGE_KEY);
                storage.session.remove(NG_STORAGE_KEY);
            }

            s.prop75 = config.page.wordCount || 0;
            s.eVar75 = config.page.wordCount || 0;
        };

        this.go = function(c) {

            config = c; // update the module-wide config

            // must be set before the Omniture file is parsed
            window.s_account = config.page.omnitureAccount;

            s = window.s;
            this.populatePageProperties();
            this.logView();
            mediator.emit('analytics:ready');
        };

        this.confirmPageView = function() {
            // This ensures that the Omniture pageview beacon has successfully loaded
            // Can be used as a way to prevent other events to fire earlier than the pageview
            var self = this;
            var checkForPageViewInterval = setInterval(function() {
                // s_i_guardiangu-frontend_guardiangu-network is a globally defined Image() object created by Omniture
                // It does not sit in the DOM tree, and seems to be the only surefire way
                // to check if the intial beacon has been successfully sent
                var img = window['s_i_guardiangu-frontend_guardiangu-network'];
                if (typeof(img) !== 'undefined' && (img.complete === true || img.width + img.height > 0)) {
                    clearInterval(checkForPageViewInterval);

                    self.pageviewSent = true;
                    mediator.emit('module:analytics:omniture:pageview:sent');
                }
            }, 250);

            // Give up after 10 seconds
            setTimeout(function() {
                clearInterval(checkForPageViewInterval);
            }, 10000);
        };

        mediator.on('module:clickstream:interaction', that.trackNonLinkEvent );

        mediator.on('module:clickstream:click', that.logTag );

        mediator.on('module:autoupdate:loaded', function() {
            that.populatePageProperties();
            that.logUpdate();
        });

        mediator.on('module:analytics:omniture:pageview:sent', function(){
            // independently log this page view
            // used for checking we have not broken analytics
            beacon.fire('/count/pva.gif');
        });

    }

    return Omniture;

});
