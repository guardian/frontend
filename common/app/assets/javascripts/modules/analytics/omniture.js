define([
    'common',
    'modules/detect',
    'modules/experiments/ab'
], function(
    common,
    detect,
    ab
) {

    // https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview

    /**
     * @param Object w 'window' object, used for testing
     */
    function Omniture(s, config, w) {

        var that = this;

        var storagePrefix = "gu.analytics.";

        w = w || {};

        this.logView = function() {
            s.t();
        };

        this.logUpdate = function() {
            s.linkTrackVars="events,eVar7";
            s.linkTrackEvents="event90";
            s.events="event90";
            s.eVar7=config.page.analyticsName;
            s.tl(true,'o',"AutoUpdate Refresh");
        };

        this.logTag = function(params) {
            var element = params[0],
                tag = params[1],
                isSamePage = params[2],
                isSameHost = params[3],
                storeObj,
                delay;

            // Remove the 'false' clause once Omniture guys support the localStorage approach...
            if (false && isSameHost && !isSamePage) {
                // Came from a link to a new page on the same host.
                // Do session storage rather than an omniture track.
                storeObj = {
                    pageName: s.pageName,
                    tag: tag,
                    time: new Date().getTime()
                };
                localStorage.setItem(storagePrefix + 'referrerVars', JSON.stringify(storeObj));
            } else {
                that.populateEventProperties(tag);
                // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
                delay = isSamePage ? true : element;
                s.tl(delay, 'o', tag);
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
            s.cookieDomainPeriods = config.page.edition === "US" ? "2" : "3";

            s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com';

            s.ce= "UTF-8";
            s.pageName  = config.page.analyticsName;

            s.prop1     = config.page.headline || '';
            s.prop3     = config.page.publication || '';
            s.prop9     = config.page.contentType || '';  //contentType

            s.channel   = (config.page.contentType === "Network Front") ? "Network Front" : config.page.section || '';
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

            s.prop31    = 'Guest user';

            s.prop47    = config.page.edition || '';

            if (ab.inTest(config.switches)) {
                var test = ab.getTest(),
                    testData = 'AB | ' + test.id + ' | ' + test.variant;

                s.prop51  = testData;
                s.evar51  = testData;
                s.event58 = testData;
            }

            s.prop56    = 'Javascript';

            s.prop65    = config.page.headline || '';

            s.prop68    = detect.getConnectionSpeed(w.performance, null, true);

            if (config.page.webPublicationDate) {
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }

            if (window.location.hash === '#popup:homescreen') {
                s.eVar38 = 'popup:homescreen';
            }
        };

        this.loaded = function() {
            this.populatePageProperties();
            this.logView();
            common.mediator.on('module:clickstream:click', this.logTag );
            common.mediator.emit('module:omniture:loaded');
        };

        this.init = function() {

            // must be set before the Omniture file is parsed
            window.s_account = config.page.omnitureAccount;

            var that = this;

            // if the omniture object was not injected in to the constructor
            // use the global 's' object

            if (s !== null) {
                that.loaded();
            } else {
                var dependOn = ['js!omniture'];
                require(dependOn, function(placeholder){
                    s = window.s;
                    that.loaded();
                });
            }

            common.mediator.on('module:autoupdate:loaded', function() {
                that.populatePageProperties();
                that.logUpdate();
            });

            common.mediator.on('module:clickstream:interaction', that.trackNonLinkEvent );
        };

    }

    return Omniture;

});

