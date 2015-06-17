/* global guardian */
/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
define([
    'omniture',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/date-formats',
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
    $,
    _,
    config,
    cookies,
    dateFormats,
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
    var R2_STORAGE_KEY = 's_ni', // DO NOT CHANGE THIS, ITS IS SHARED WITH R2. BAD THINGS WILL HAPPEN!
        NG_STORAGE_KEY = 'gu.analytics.referrerVars';

    function Omniture() {
        this.isEmbed = !!guardian.isEmbed;
        this.s = window.s;
        this.pageviewSent = false;
        this.addHandlers();
    }

    Omniture.prototype.addHandlers = function () {
        mediator.on('module:clickstream:interaction', this.trackLinkImmediate.bind(this));

        mediator.on('module:clickstream:click', this.logTag.bind(this));

        mediator.on('module:analytics:omniture:pageview:sent', function () {
            // Independently log this page view, used for checking we have not broken analytics.
            // We want to exclude off-site embed tracking from this data.
            if (!this.isEmbed) {
                beacon.fire('/count/pva.gif');
            }
        }.bind(this));
    };

    Omniture.prototype.logView = function () {
        this.s.t();
        this.confirmPageView();
    };

    Omniture.prototype.generateTrackingImageString = function () {
        return 's_i_' + window.s_account.split(',').join('_');
    };

    // Certain pages have specfic channel rules
    Omniture.prototype.getChannel = function () {
        if (config.page.contentType === 'Network Front') {
            return 'Network Front';
        } else if (this.isEmbed) {
            return 'Embedded';
        }
        return config.page.section || '';
    };

    Omniture.prototype.logTag = function (spec) {
        var storeObj,
            delay;

        if (!spec.validTarget) {
            return;
        }

        if (spec.sameHost && !spec.samePage) {
            // Came from a link to a new page on the same host,
            // so do session storage rather than an omniture track.
            storeObj = {
                pageName: this.s.pageName,
                tag: spec.tag || 'untracked',
                time: new Date().getTime()
            };
            try { sessionStorage.setItem(R2_STORAGE_KEY, storeObj.tag); } catch (e) {/**/}
            storage.session.set(NG_STORAGE_KEY, storeObj);
        } else {
            // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
            delay = spec.samePage ? true : spec.target;
            this.trackLink(delay, spec.tag, { customEventProperties: spec.customEventProperties });
        }
    };

    Omniture.prototype.populateEventProperties = function (linkName) {

        this.s.linkTrackVars = 'channel,prop2,prop3,prop4,prop8,prop9,prop10,prop13,prop25,prop31,prop37,prop47,' +
                               'prop51,prop61,prop64,prop65,prop74,eVar7,eVar37,eVar38,eVar39,eVar50,events';
        this.s.linkTrackEvents = 'event37';
        this.s.events = 'event37';
        this.s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + linkName : linkName;

        // this allows 'live' Omniture tracking of Navigation Interactions
        this.s.eVar7 = 'D=pageName';
        this.s.prop37 = 'D=v37';

        if (/social/.test(linkName)) {
            s.linkTrackVars   += ',eVar12';
            s.linkTrackEvents += ',event16';
            s.events          += ',event16';
            s.eVar12           = linkName;
        }
    };

    // used where we don't have an element to pass as a tag, eg. keyboard interaction
    Omniture.prototype.trackLinkImmediate = function (linkName) {
        // A linkObject of value 'true' means track link with no delay.
        this.trackLink(true, linkName);
    };

    Omniture.prototype.trackLink = function (linkObject, linkName, options) {
        options = options || {};
        this.populateEventProperties(linkName);
        _.assign(this.s, options.customEventProperties);
        this.s.tl(linkObject, 'o', linkName);
        _.forEach(options.customEventProperties, function (value, key) {
            delete this.s[key];
        });
    };

    Omniture.prototype.populatePageProperties = function () {
        var d,
            now      = new Date(),
            tpA      = this.s.getTimeParting('n', '+0'),
            /* Retrieve navigation interaction data */
            ni       = storage.session.get(NG_STORAGE_KEY),
            platform = 'frontend',
            mvt      = ab.makeOmnitureTag(document),
            // Tag the identity of this user, which is composed of
            // the omniture visitor id, the ophan browser id, and the frontend-only mvt id.
            mvtId    = mvtCookie.getMvtFullId(),
            webPublicationDate = config.page.webPublicationDate;

        // http://www.scribd.com/doc/42029685/15/cookieDomainPeriods
        this.s.cookieDomainPeriods = '2';

        this.s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com,theguardian.com';

        this.s.trackingServer = 'hits.theguardian.com';
        this.s.trackingServerSecure = 'hits-secure.theguardian.com';

        this.s.ce = 'UTF-8';
        this.s.pageName  = config.page.analyticsName;

        this.s.prop1     = config.page.headline || '';

        // eVar1 contains today's date
        // in the Omniture backend it only ever holds the first
        // value a user gets, so in effect it is the first time
        // we saw this user
        this.s.eVar1 = now.getFullYear() + '/' +
            pad(now.getMonth() + 1, 2) + '/' +
            pad(now.getDate(), 2);

        if (id.getUserFromCookie()) {
            this.s.prop2 = 'GUID:' + id.getUserFromCookie().id;
            this.s.eVar2 = 'GUID:' + id.getUserFromCookie().id;
        }

        this.s.prop3     = config.page.publication || '';

        this.s.channel   = this.getChannel();
        this.s.prop4     = config.page.keywords || '';
        this.s.prop6     = config.page.author || '';
        this.s.prop7     = webPublicationDate ? dateFormats.utcDateString(webPublicationDate) : '';
        this.s.prop8     = config.page.pageCode || '';
        this.s.prop9     = config.page.contentType || '';
        this.s.prop10    = config.page.tones || '';

        this.s.prop13    = config.page.series || '';

        // see http://blogs.adobe.com/digitalmarketing/mobile/responsive-web-design-and-web-analytics/
        this.s.eVar18    = detect.getBreakpoint();

        // getting clientWidth causes a reflow, so avoid using if possible
        this.s.eVar21    = (window.innerWidth || document.documentElement.clientWidth)
                    + 'x'
                    + (window.innerHeight || document.documentElement.clientHeight);
        this.s.eVar32    = detect.getOrientation();

        /* Set Time Parting Day and Hour Combination - 0 = GMT */
        this.s.prop20    = tpA[2] + ':' + tpA[1];
        this.s.eVar20    = 'D=c20';

        this.s.prop25    = config.page.blogs || '';

        this.s.prop60    = detect.isFireFoxOSApp() ? 'firefoxosapp' : null;

        this.s.prop19    = platform;

        this.s.prop31    = id.getUserFromCookie() ? 'registered user' : 'guest user';
        this.s.eVar31    = id.getUserFromCookie() ? 'registered user' : 'guest user';

        this.s.prop40    = detect.adblockInUse;

        this.s.prop47    = config.page.edition || '';

        this.s.prop51  = mvt;
        this.s.eVar51  = mvt;
        this.s.list1  = mvt; // allows us to 'unstack' the AB test names (allows longer names)

        // List of components on the page
        this.s.list2 = _.uniq($('[data-component]')
            .map(function (x) { return $(x).attr('data-component'); }))
            .toString();
        this.s.list3 = _.map(history.getPopularFiltered(), function (tagTuple) { return tagTuple[1]; }).join(',');

        if (this.s.prop51) {
            this.s.events = this.s.apl(this.s.events, 'event58', ',');
        }

        if (mvtId) {
            this.s.eVar60 = mvtId;
        }

        if (config.page.commentable) {
            this.s.events = this.s.apl(this.s.events, 'event46', ',');
        }

        if (config.page.section === 'identity')  {
            this.s.prop11 = 'Users';
            this.s.prop9 = 'userid';
            this.s.eVar27 = config.page.omnitureErrorMessage || '';
            this.s.eVar42 = config.page.returnUrl || '';
            this.s.hier2 = 'GU/Users/Registration';
            this.s.events = this.s.apl(this.s.events, config.page.omnitureEvent, ',');
        }

        this.s.prop56    = 'Javascript';

        // not all pages have a production office
        if (config.page.productionOffice) {
            this.s.prop64 = config.page.productionOffice;
        }

        /* Omniture library version */
        this.s.prop62    = 'Guardian JS-1.4.1 20140914';

        this.s.prop63    = detect.getPageSpeed();

        this.s.prop65    = config.page.headline || '';

        this.s.prop67    = 'nextgen-served';

        if (webPublicationDate) {
            this.s.prop30 = 'content';
        } else {
            this.s.prop30 = 'non-content';
        }

        if (this.s.getParamValue('INTCMP') !== '') {
            this.s.eVar50 = this.s.getParamValue('INTCMP');
        }
        this.s.eVar50 = this.s.getValOnce(this.s.eVar50, 's_intcampaign', 0);

        // the operating system
        this.s.eVar58 = navigator.platform || 'unknown';

        // the number of Guardian links inside the body
        if (config.page.inBodyInternalLinkCount) {
            this.s.prop58 = config.page.inBodyInternalLinkCount;
        }

        // the number of External links inside the body
        if (config.page.inBodyExternalLinkCount) {
            this.s.prop69 = config.page.inBodyExternalLinkCount;
        }

        if (ni) {
            d = new Date().getTime();
            if (d - ni.time < 60 * 1000) { // One minute
                this.s.eVar24 = ni.pageName;
                this.s.eVar37 = ni.tag;
                this.s.events = 'event37';

                // this allows 'live' Omniture tracking of Navigation Interactions
                this.s.eVar7 = ni.pageName;
                this.s.prop37 = ni.tag;
            }
            storage.session.remove(R2_STORAGE_KEY);
            storage.session.remove(NG_STORAGE_KEY);
        }

        this.s.prop73 = detect.isFacebookApp() ? 'facebook app' : detect.isTwitterApp() ? 'twitter app' : null;

        this.s.prop75 = config.page.wordCount || 0;
        this.s.eVar75 = config.page.wordCount || 0;

        if (this.isEmbed) {
            this.s.eVar11 = this.s.prop11 = 'Embedded';

            // Get iframe's parent url: http://www.nczonline.net/blog/2013/04/16/getting-the-url-of-an-iframes-parent
            if (!!window.parent && window.parent !== window) {
                this.s.referrer = document.referrer;
            }
        }
    };

    Omniture.prototype.go = function () {
        this.populatePageProperties();
        this.logView();
        mediator.emit('analytics:ready');
    };

    Omniture.prototype.confirmPageView = function () {
        // This ensures that the Omniture pageview beacon has successfully loaded
        // Can be used as a way to prevent other events to fire earlier than the pageview
        var checkForPageViewInterval = setInterval(function () {
            // s_i_guardiangu-frontend_guardiangu-network is a globally defined Image() object created by Omniture
            // It does not sit in the DOM tree, and seems to be the only surefire way
            // to check if the intial beacon has been successfully sent
            var img = window[this.generateTrackingImageString()];
            if (typeof (img) !== 'undefined' && (img.complete === true || img.width + img.height > 0)) {
                clearInterval(checkForPageViewInterval);

                this.pageviewSent = true;
                mediator.emit('module:analytics:omniture:pageview:sent');
            }
        }.bind(this), 250);

        // Give up after 10 seconds
        setTimeout(function () {
            clearInterval(checkForPageViewInterval);
        }, 10000);
    };

    // A single Omniture instance for the whole application.
    return new Omniture();
});
