/* global guardian */
/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
define([
    'omniture',
    'lodash/collections/map',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/pad',
    'common/utils/storage',
    'common/modules/analytics/beacon',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/ab',
    'common/modules/onward/history',
    'common/modules/identity/api'
], function (
    s,
    map,
    config,
    cookies,
    detect,
    mediator,
    pad,
    storage,
    beacon,
    mvtCookie,
    ab,
    history,
    id
) {

    // https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview

    /**
     * @param Object w 'window' object, used for testing
     */
    function Omniture(s, w) {

        var R2_STORAGE_KEY = 's_ni', // DO NOT CHANGE THIS, ITS IS SHARED WITH R2. BAD THINGS WILL HAPPEN!
            NG_STORAGE_KEY = 'gu.analytics.referrerVars',
            isEmbed = !!guardian.isEmbed,
            that = this;

        w = w || {};

        this.pageviewSent = false;

        this.logView = function () {
            s.t();
            this.confirmPageView();
        };

        this.logUpdate = function () {
            s.linkTrackVars = 'events,eVar7';
            s.linkTrackEvents = 'event90';
            s.events = 'event90';
            s.eVar7 = config.page.analyticsName;
            s.tl(true, 'o', 'AutoUpdate Refresh');
        };

        this.generateTrackingImageString = function () {
            return 's_i_' + window.s_account.split(',').join('_');
        };

        // Certain pages have specfic channel rules
        this.getChannel = function () {
            if (config.page.contentType === 'Network Front') {
                return 'Network Front';
            } else if (isEmbed) {
                return 'Embedded';
            }
            return config.page.section || '';
        };

        this.logTag = function (spec) {
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
                try { sessionStorage.setItem(R2_STORAGE_KEY, storeObj.tag); } catch (e) {}
                storage.session.set(NG_STORAGE_KEY, storeObj);
            } else {
                that.populateEventProperties(spec.tag);
                // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
                delay = spec.samePage ? true : spec.target;
                s.tl(delay, 'o', spec.tag);
            }
        };

        this.populateEventProperties = function (tag) {
            s.linkTrackVars = 'eVar37,eVar7,prop37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + tag : tag;

            // this allows 'live' Omniture tracking of Navigation Interactions
            s.eVar7 = 'D=pageName';
            s.prop37 = 'D=v37';

            if (/social/.test(tag)) {
                s.linkTrackVars   += ',eVar12,prop4,prop9,prop10';
                s.linkTrackEvents += ',event16';
                s.eVar12           = tag;
                s.prop4            = config.page.keywords || '';
                s.prop9            = config.page.contentType || '';
                s.prop10           = config.page.tones || '';
                s.events           = s.apl(s.events, 'event16', ',');
            }
        };

        // used where we don't have an element to pass as a tag
        // eg. keyboard interaction
        this.trackNonLinkEvent = function (tagStr) {
            s.linkTrackVars = 'eVar37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + tagStr : tagStr;
            s.tl(true, 'o', tagStr);
        };

        this.populatePageProperties = function () {

            var d,
                now      = new Date(),
                tpA      = s.getTimeParting('n', '+0'),
                /* Retrieve navigation interaction data */
                ni       = storage.session.get(NG_STORAGE_KEY),
                platform = 'frontend',
                mvt      = ab.makeOmnitureTag(document),
                // Tag the identity of this user, which is composed of
                // the omniture visitor id, the ophan browser id, and the frontend-only mvt id.
                mvtId    = mvtCookie.getMvtFullId();

            // http://www.scribd.com/doc/42029685/15/cookieDomainPeriods
            s.cookieDomainPeriods = '2';

            s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com';

            s.trackingServer = 'hits.theguardian.com';
            s.trackingServerSecure = 'hits-secure.theguardian.com';

            s.ce = 'UTF-8';
            s.pageName  = config.page.analyticsName;

            s.prop1     = config.page.headline || '';

            // eVar1 contains today's date
            // in the Omniture backend it only ever holds the first
            // value a user gets, so in effect it is the first time
            // we saw this user
            s.eVar1 = now.getFullYear() + '/' +
                pad(now.getMonth() + 1, 2) + '/' +
                pad(now.getDate(), 2);

            if (id.getUserFromCookie()) {
                s.prop2 = 'GUID:' + id.getUserFromCookie().id;
                s.eVar2 = 'GUID:' + id.getUserFromCookie().id;
            }

            s.prop3     = config.page.publication || '';

            s.channel   = this.getChannel();
            s.prop4     = config.page.keywords || '';
            s.prop6     = config.page.author || '';
            s.prop7     = config.page.webPublicationDate || '';
            s.prop8     = config.page.pageCode || '';
            s.prop9     = config.page.contentType || '';
            s.prop10    = config.page.tones || '';

            s.prop13    = config.page.series || '';

            // see http://blogs.adobe.com/digitalmarketing/mobile/responsive-web-design-and-web-analytics/
            s.eVar18    = detect.getBreakpoint();
            // getting clientWidth causes a reflow, so avoid using if possible
            s.eVar21    = (window.innerWidth || document.documentElement.clientWidth)
                        + 'x'
                        + (window.innerHeight || document.documentElement.clientHeight);
            s.eVar32    = detect.getOrientation();

            /* Set Time Parting Day and Hour Combination - 0 = GMT */
            s.prop20    = tpA[2] + ':' + tpA[1];
            s.eVar20    = 'D=c20';

            s.prop25    = config.page.blogs || '';

            s.prop60    = detect.isFireFoxOSApp() ? 'firefoxosapp' : null;

            s.prop19     = platform;
            s.eVar19     = platform;

            s.prop31    = id.getUserFromCookie() ? 'registered user' : 'guest user';
            s.eVar31    = id.getUserFromCookie() ? 'registered user' : 'guest user';

            s.prop47    = config.page.edition || '';

            s.prop51  = mvt;
            s.eVar51  = mvt;

            s.list3 = map(history.getPopularFiltered(), function (tagTuple) { return tagTuple[1]; }).join(',');

            if (s.prop51) {
                s.events = s.apl(s.events, 'event58', ',');
            }

            if (mvtId) {
                s.eVar60 = mvtId;
            }

            if (config.page.commentable) {
                s.events = s.apl(s.events, 'event46', ',');
            }

            if (config.page.section === 'identity')  {
                s.prop11 = 'Users';
                s.prop9 = 'userid';
                s.eVar27 = config.page.omnitureErrorMessage || '';
                s.eVar42 = config.page.returnUrl || '';
                s.hier2 = 'GU/Users/Registration';
                s.events = s.apl(s.events, config.page.omnitureEvent, ',');
            }

            s.prop56    = 'Javascript';

            // not all pages have a production office
            if (config.page.productionOffice) {
                s.prop64 = config.page.productionOffice;
            }

            /* Omniture library version */
            s.prop62    = 'Guardian JS-1.4.1 20140914';

            s.prop63    = detect.getPageSpeed();

            s.prop65    = config.page.headline || '';

            s.prop67    = 'nextgen-served';

            s.prop68    = detect.getConnectionSpeed(w.performance, null, true);

            if (config.page.webPublicationDate) {
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }

            if (s.getParamValue('INTCMP') !== '') {
                s.eVar50 = s.getParamValue('INTCMP');
            }
            s.eVar50 = s.getValOnce(s.eVar50, 's_intcampaign', 0);

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

            if (ni) {
                d = new Date().getTime();
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

            if (isEmbed) {
                s.eVar11 = s.prop11 = 'Embedded';
            }
        };

        this.go = function () {
            this.populatePageProperties();
            this.logView();
            mediator.emit('analytics:ready');
        };

        this.confirmPageView = function () {
            // This ensures that the Omniture pageview beacon has successfully loaded
            // Can be used as a way to prevent other events to fire earlier than the pageview
            var self = this,
                checkForPageViewInterval = setInterval(function () {
                    // s_i_guardiangu-frontend_guardiangu-network is a globally defined Image() object created by Omniture
                    // It does not sit in the DOM tree, and seems to be the only surefire way
                    // to check if the intial beacon has been successfully sent
                    var img = window[self.generateTrackingImageString()];
                    if (typeof (img) !== 'undefined' && (img.complete === true || img.width + img.height > 0)) {
                        clearInterval(checkForPageViewInterval);

                        self.pageviewSent = true;
                        mediator.emit('module:analytics:omniture:pageview:sent');
                    }
                }, 250);

            // Give up after 10 seconds
            setTimeout(function () {
                clearInterval(checkForPageViewInterval);
            }, 10000);
        };

        mediator.on('module:clickstream:interaction', that.trackNonLinkEvent);

        mediator.on('module:clickstream:click', that.logTag);

        mediator.on('module:autoupdate:loaded', function () {
            that.populatePageProperties();
            that.logUpdate();
        });

        mediator.on('module:analytics:omniture:pageview:sent', function () {
            // Independently log this page view, used for checking we have not broken analytics.
            // We want to exclude off-site embed tracking from this data.
            if (!isEmbed) { beacon.fire('/count/pva.gif'); }
        });

    }

    return Omniture;

});
