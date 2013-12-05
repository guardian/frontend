/*global s_i_guardian:true */
define([
    'common',
    'utils/detect',
    'modules/experiments/ab',
    'utils/storage',
    'modules/identity/api',
    'modules/analytics/errors',
    'utils/cookies',
    'omniture',
    'modules/analytics/mvt-cookie'
], function(
    common,
    detect,
    ab,
    storage,
    id,
    Errors,
    Cookies,
    s,
    mvtCookie
    ) {

    // https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview

    /**
     * @param Object w 'window' object, used for testing
     */
    function Omniture(s, w) {

        var storagePrefix = "gu.analytics.",
            config,
            that = this;

        w = w || {};

        this.pageviewSent = false;

        this.logView = function() {
            s.t();
            this.confirmPageView();
        };

        this.logUpdate = function() {
            s.linkTrackVars="events,eVar7";
            s.linkTrackEvents="event90";
            s.events="event90";
            s.eVar7=config.page.analyticsName;
            s.tl(true,'o',"AutoUpdate Refresh");
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
                storage.session.set(storagePrefix + 'referrerVars', storeObj);
            } else {
                that.populateEventProperties(spec.tag);
                // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
                delay = spec.samePage ? true : spec.target;
                s.tl(delay, 'o', spec.tag);
            }
        };

        this.populateEventProperties = function(tag){
            s.linkTrackVars = 'eVar37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + tag : tag;
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
            s.cookieDomainPeriods = "2";

            s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com';

            s.trackingServer="hits.theguardian.com";
            s.trackingServerSecure="hits-secure.theguardian.com";

            s.ce= "UTF-8";
            s.pageName  = config.page.analyticsName;

            s.prop1     = config.page.headline || '';

            if(id.getUserFromCookie()) {
                s.prop2 = "GUID:" + id.getUserFromCookie().id;
                s.eVar2 = "GUID:" + id.getUserFromCookie().id;
            }

            s.prop3     = config.page.publication || '';


            s.channel = config.page.contentType === "Network Front" ? "Network Front" : config.page.section || '';
            s.prop9     = config.page.contentType || '';  //contentType

            s.prop4     = config.page.keywords || '';
            s.prop6     = config.page.author || '';
            s.prop7     = config.page.webPublicationDate || '';
            s.prop8     = config.page.pageCode || '';
            s.prop9     = config.page.contentType || '';
            s.prop10    = config.page.tones || '';

            s.prop13    = config.page.series || '';
            s.prop25    = config.page.blogs || '';

            s.prop14    = config.page.buildNumber || '';

            var platform = "frontend";
            s.prop19     = platform;
            s.eVar19     = platform;

            s.prop31    = id.getUserFromCookie() ? "registered user" : "guest user";
            s.eVar31    = id.getUserFromCookie() ? "registered user" : "guest user";

            s.prop47    = config.page.edition || '';

            var mvt = ab.makeOmnitureTag(config, document);
            if (mvt.length > 0) {

                s.prop51  = mvt;
                s.eVar51  = mvt;

                // prefix all the MVT tests with the alpha user tag if present
                if (Cookies.get('GU_ALPHA') === "true") {
                    var alphaTag = 'r2alpha,';
                    s.prop51  = alphaTag + s.prop51;
                    s.eVar51  = alphaTag + s.eVar51;
                }

                s.events = s.apl(s.events,'event58',',');
            }

            // Tag the identity of this user, which is composed of
            // the omniture visitor id, the ophan browser id, and the frontend-only mvt id.
            var mvtId = mvtCookie.getMvtFullId();

            if (mvtId) {
                s.prop60 = mvtId;
                s.evar60 = mvtId;
            }

            if (config.page.commentable) {
                s.events = s.apl(s.events,'event46',',');
            }

            if (config.page.section === "identity")  {
                s.prop11 = 'Users';
                s.prop9 = "userid";
                s.eVar27 = config.page.omnitureErrorMessage || '';
                s.eVar42 = config.page.returnUrl || '';
                s.hier2="GU/Users/Registration";
                s.events = s.apl(s.events, config.page.omnitureEvent, ',');
            }

            s.prop56    = detect.canSwipe() ? 'Javascript with swipe' : 'Javascript';

            s.prop65    = config.page.headline || '';

            s.prop67    = "nextgen-served";

            s.prop68    = detect.getConnectionSpeed(w.performance, null, true);

            if (config.page.webPublicationDate) {
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }

            /* Retrieve navigation interaction data, incl. swipe */
            var ni = storage.session.get('gu.analytics.referrerVars');
            if (ni) {
                var d = new Date().getTime();
                if (d - ni.time < 60 * 1000) { // One minute
                    s.eVar24 = ni.pageName;
                    s.eVar37 = ni.tag;
                    s.events   = 'event37';
                }
                storage.session.remove('gu.analytics.referrerVars');
            }
        };

        this.loaded = function(callback) {
            this.populatePageProperties();
            this.logView();
            if (typeof callback === 'function') {
                callback();
            }
        };

        this.go = function(c, callback) {
            var that = this;

            config = c; // update the module-wide config

            // must be set before the Omniture file is parsed
            window.s_account = config.page.omnitureAccount;

            s = window.s;
            that.loaded(callback);
        };

        this.confirmPageView = function() {
            // This ensures that the Omniture pageview beacon has successfully loaded
            // Can be used as a way to prevent other events to fire earlier than the pageview
            var self = this;
            var checkForPageViewInterval = setInterval(function() {
                // s_i_guardian is a globally defined Image() object created by Omniture
                // It does not sit in the DOM tree, and seems to be the only surefire way
                // to check if the intial beacon has been successfully sent
                if (typeof(s_i_guardian) !== 'undefined' &&
                    (s_i_guardian.complete === true || s_i_guardian.width + s_i_guardian.height > 0)) {
                    clearInterval(checkForPageViewInterval);

                    self.pageviewSent = true;
                    common.mediator.emit('module:analytics:omniture:pageview:sent');
                }
            }, 250);

            // Give up after 10 seconds
            setTimeout(function() {
                clearInterval(checkForPageViewInterval);
            }, 10000);
        };

        common.mediator.on('module:clickstream:interaction', that.trackNonLinkEvent );

        common.mediator.on('module:clickstream:click', that.logTag );

        common.mediator.on('module:autoupdate:loaded', function() {
            that.populatePageProperties();
            that.logUpdate();
        });

    }

    return Omniture;

});
