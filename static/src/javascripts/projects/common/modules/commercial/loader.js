/*
    Module: commercial/loader.js
    Description: Loads our commercial components
*/
define([
    'bean',
    'bonzo',
    'raven',
    'lodash/collections/map',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/component',
    'common/modules/lazyload',
    'common/modules/ui/tabs'
], function (
    bean,
    bonzo,
    raven,
    map,
    $,
    config,
    mediator,
    storage,
    Component,
    LazyLoad,
    Tabs
) {

    /**
     * Loads commercial components.
     *
     * BEWARE that this code is depended upon by the ad server.
     *
     * ```
     * require(['common/modules/commercial/loader'], function (CommercialComponent) {
     *     var slot = document.querySelector('[data-base="SLOT_NAME"]');
     *     var c = new CommercialComponent({config: guardian, oastoken: '%%C%%?'}).init('COMPONENT_NAME', slot);
     * })
     * ```
     *
     * @constructor
     * @extends Component
     * @param {Object=} options
     */
    var Loader = function (options) {
        var page = (options.config && options.config.page) || config.page || {};

        this.pageId                 = page.pageId;
        this.keywordIds             = page.keywordIds || '';
        this.section                = page.section;
        this.host                   = page.ajaxUrl + '/commercial/';
        this.isbn                   = page.isbn || '';
        this.oastoken               = options.oastoken || '';
        this.jobs                   = options.jobIds || '';
        this.adType                 = options.adType || 'desktop';
        this.multiComponents        = map(options.components || [], function (c) { return 'c=' + c; }).join('&');
        this.capi                   = map(options.capi || [], function (t) {return 't=' + t;}).join('&');
        this.capiTitle              = options.capi_title || '';
        this.capiLinkUrl            = options.capi_link_url || '';
        this.capiAboutLinkUrl       = options.capi_about_link_url || '';
        this.logo                   = options.logo || '';
        this.components             = {
            bestbuy:            this.host + 'money/bestbuys.json',
            bestbuyHigh:        this.host + 'money/bestbuys-high.json',
            book:               this.host + 'books/book.json?'                  + 't=' + this.isbn,
            books:              this.host + 'books/bestsellers.json?'           + this.getKeywords(),
            booksMedium:        this.host + 'books/bestsellers-medium.json?'    + this.getKeywords(),
            booksHigh:          this.host + 'books/bestsellers-high.json?'      + this.getKeywords(),
            jobs:               this.host + 'jobs.json?'                        + [this.listToParams('t', this.jobs ? this.jobs.split(',') : []), this.getKeywords()].join('&'),
            jobsHigh:           this.host + 'jobs-high.json?'                   + this.getKeywords(),
            jobsV2:             this.host + 'jobs-V2.json?'                     + [this.listToParams('t', this.jobs ? this.jobs.split(',') : []), this.getKeywords()].join('&'),
            jobsHighV2:         this.host + 'jobs-high-v2.json?'                + this.getKeywords(),
            masterclasses:      this.host + 'masterclasses.json?'               + this.getKeywords(),
            masterclassesHigh:  this.host + 'masterclasses-high.json?'          + this.getKeywords(),
            soulmates:          this.host + 'soulmates/mixed.json',
            soulmatesHigh:      this.host + 'soulmates/mixed-high.json',
            travel:             this.host + 'travel/offers.json?'               + 's=' + this.section + '&' + this.getKeywords(),
            travelHigh:         this.host + 'travel/offers-high.json?'          + 's=' + this.section + '&' + this.getKeywords(),
            capi:               this.host + 'capi.json?'                        + this.capi + '&' + this.getKeywords() + '&l=' + this.logo + '&ct=' + this.capiTitle + '&cl=' + this.capiLinkUrl + '&cal=' + this.capiAboutLinkUrl,
            multi:              this.host + 'multi.json?'                       + this.multiComponents
        };
        this.postLoadEvents = {
            books: function (el) {
                bean.on(el, 'click', '.commercial__search__submit', function () {
                    var str = 'merchandising-bookshop-v0_7_2014-03-12-low-' + el.querySelector('.commercial__search__input').value,
                        val = (page.contentType) ? page.contentType + ':' + str : str;

                    s.linkTrackVars = 'prop22,eVar22,eVar37,events';
                    s.linkTrackEvents = 'event7,event37';
                    s.events = 'event7,event37';
                    s.prop22 = val;
                    s.eVar22 = val;
                    s.eVar37 = val;
                    s.tl(true, 'o', str);
                });
            },
            bestbuy: function (el) {
                new Tabs().init(el);
            }
        };

        return this;
    };

    Component.define(Loader);

    Loader.prototype.listToParams = function (param, itemArray) {
        return map(itemArray, function (item) {
            return param + '=' + encodeURIComponent(item);
        }).join('&');
    };

    Loader.prototype.getKeywords = function () {
        if (this.keywordIds) {
            var keywords = map(this.keywordIds.split(','), function (keywordId) {
                    return keywordId.split('/').pop();
                });
            return this.listToParams('k', keywords);
        } else {
            return 'k=' + this.pageId.split('/').pop();
        }
    };

    /**
     * @param {Element} target
     */
    Loader.prototype.load = function (name, target) {
        var self = this,
            url  = this.components[name];

        new LazyLoad({
            url: url,
            container: target,
            beforeInsert: function (html) {
                // Currently we are replacing the OmnitureToken with nothing. This will change once
                // commercial components have properly been setup in the lovely mess that is Omniture!
                return html ? html.replace(/%OASToken%/g, self.oastoken).replace(/%OmnitureToken%/g, '') : html;
            },
            success: function () {
                if (name in self.postLoadEvents) {
                    self.postLoadEvents[name](target);
                }

                mediator.emit('modules:commercial/loader:loaded');
            }
        }).load();

        return this;
    };

    /**
     * @param {String}  name
     * @param {Element} el
     */
    Loader.prototype.init = function (name, el) {

        if (this.components[name] === undefined) {
            raven.captureMessage('Unknown commercial component: ' + name);
            return false;
        }

        return this.load(name, el);
    };

    return Loader;
});
