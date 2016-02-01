/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/date-formats',
    'common/utils/defer-to-analytics',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/analytics/beacon',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/ab',
    'common/modules/onward/history',
    'common/modules/identity/api',
    'lodash/objects/assign',
    'lodash/collections/forEach',
    'lodash/arrays/uniq',
    'lodash/collections/map',
    'common/utils/robust'
], function (
    $,
    config,
    cookies,
    dateFormats,
    deferToAnalytics,
    detect,
    mediator,
    storage,
    beacon,
    mvtCookie,
    ab,
    history,
    id,
    assign,
    forEach,
    uniq,
    map,
    robust
) {
    var R2_STORAGE_KEY = 's_ni', // DO NOT CHANGE THIS, ITS IS SHARED WITH R2. BAD THINGS WILL HAPPEN!
        NG_STORAGE_KEY = 'gu.analytics.referrerVars',
        standardProps = 'channel,prop1,prop2,prop3,prop4,prop8,prop9,prop10,prop13,prop25,prop31,prop37,prop38,prop47,' +
            'prop51,prop61,prop64,prop65,prop74,prop40,prop63,eVar7,eVar37,eVar38,eVar39,eVar50,eVar24,eVar60,eVar51,' +
            'eVar31,eVar18,eVar32,eVar40,list1,list2,list3,events';

    function Omniture() {
        this.s = window.s;
        this.pageviewSent = false;
        this.addHandlers();
    }

    Omniture.prototype.getStandardProps = function () {
        return standardProps;
    };

    Omniture.prototype.addHandlers = function () {
        mediator.on('module:clickstream:interaction', this.trackLinkImmediate.bind(this));

        var logTag = this.logTag.bind(this);
        mediator.on('module:clickstream:click', function (spec) {
            // We don't want tracking errors to terminate the event emitter, as
            // this will mean other event listeners will not be called.
            robust.catchErrorsAndLog('c-analytics', function () { logTag(spec); });
        });
    };

    Omniture.prototype.logView = function () {
        this.s.tl(true, 'o', 'Omniture topup call');
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
            // Do not perform a same-page track link when there isn't a tag.
            if (spec.tag) {
                // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
                delay = spec.samePage ? true : spec.target;
                this.trackLink(delay, spec.tag, {customEventProperties: spec.customEventProperties});
            }
        }
    };

    Omniture.prototype.populateEventProperties = function (linkName) {

        this.s.linkTrackVars = standardProps;
        this.s.linkTrackEvents = 'event37';
        this.s.events = 'event37';
        this.s.eVar37 = (config.page.contentType) ? config.page.contentType + ':' + linkName : linkName;

        // this allows 'live' Omniture tracking of Navigation Interactions
        this.s.eVar7 = 'D=pageName';
        this.s.prop37 = 'D=v37';

        if (/social/.test(linkName)) {
            this.s.linkTrackVars   += ',eVar12';
            this.s.linkTrackEvents += ',event16';
            this.s.events          += ',event16';
            this.s.eVar12           = linkName;
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
        assign(this.s, options.customEventProperties);
        this.s.tl(linkObject, 'o', linkName);
        forEach(options.customEventProperties, function (value, key) {
            delete this.s[key];
        });
    };

    Omniture.prototype.populatePageProperties = function () {
        var mvt = ab.makeOmnitureTag(document);

        this.s.prop40    = detect.adblockInUse() || detect.getFirefoxAdblockPlusInstalled();
        this.s.eVar51    = mvt;
        this.s.list1     = mvt; // allows us to 'unstack' the AB test names (allows longer names)

        this.s.linkTrackVars = standardProps;
        this.s.linkTrackEvents = 'None';

    };

    Omniture.prototype.go = function () {
        this.populatePageProperties();
        this.logView();
        mediator.emit('analytics:ready');
    };

    // A single Omniture instance for the whole application.
    return new Omniture();
});
