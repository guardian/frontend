/*
    Module: commercial/loader.js
    Description: Loads our commercial components
*/
define([
    'bonzo',
    'common/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/lazyload',
    'common/modules/component',
    'common/modules/onward/history',
    'common/modules/ui/images',
    'bean',
    'common/modules/ui/tabs'
], function (
    bonzo,
    $,
    mediator,
    storage,
    LazyLoad,
    Component,
    History,
    images,
    bean,
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
    var Loader = function(options) {
        var conf = options.config.page || {};

        this.pageId             = conf.pageId;
        this.keywords           = conf.keywords || '';
        this.section            = conf.section;
        this.host               = conf.ajaxUrl + '/commercial/';
        this.desktopUserVariant = conf.ab_commercialInArticleDesktop || '';
        this.mobileUserVariant  = conf.ab_commercialInArticleMobile || '';
        this.oastoken           = options.oastoken || '';
        this.adType             = options.adType || 'desktop';
        this.userSegments       = 'seg=' + (new History().getSize() <= 1 ? 'new' : 'repeat');
        this.components         = {
            bestbuy:           this.host + 'money/bestbuys.json?'           + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            bestbuyHigh:       this.host + 'money/bestbuys-high.json?'      + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            book:              this.host + 'books/book/' + this.pageId      + '.json',
            books:             this.host + 'books/bestsellers.json?'        + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            booksMedium:       this.host + 'books/bestsellers-medium.json?' + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            booksHigh:         this.host + 'books/bestsellers-high.json?'   + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            jobs:              this.host + 'jobs.json?'                     + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            jobsHigh:          this.host + 'jobs-high.json?'                + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            masterclasses:     this.host + 'masterclasses.json?'            + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            masterclassesHigh: this.host + 'masterclasses-high.json?'       + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            soulmates:         this.host + 'soulmates/mixed.json?'          + this.userSegments + '&s=' + this.section,
            soulmatesHigh:     this.host + 'soulmates/mixed-high.json?'     + this.userSegments + '&s=' + this.section,
            travel:            this.host + 'travel/offers.json?'            + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
            travelHigh:        this.host + 'travel/offers-high.json?'       + this.userSegments + '&s=' + this.section + '&' + this.getKeywords()
        };
        this.postLoadEvents = {
            books: function(el) {
                bean.on(el, 'click', '.commercial__search__submit', function() {
                    var str = 'merchandising-bookshop-v0_7_2014-03-12-low-'+ el.querySelector('.commercial__search__input').value,
                        val = (conf.contentType) ? conf.contentType + ':' + str : str;

                    s.linkTrackVars = 'prop22,eVar22,eVar37,events';
                    s.linkTrackEvents = 'event7,event37';
                    s.events = 'event7,event37';
                    s.prop22 = val;
                    s.eVar22 = val;
                    s.eVar37 = val;
                    s.tl(true, 'o', str);
                });
            },
            bestbuy: function(el) {
                new Tabs().init(el);
            }
        };

        return this;
    };

    Component.define(Loader);

    Loader.prototype.getKeywords = function() {
        return this.keywords.split(',').map(function(keyword){
           return 'k=' + encodeURIComponent(keyword.replace(/\s/g, '-').toLowerCase());
        }).join('&');
    };

    /**
     * @param {Element} target
     */
    Loader.prototype.load = function(name, target) {
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
                images.upgrade(target);

                if(name in self.postLoadEvents) {
                    self.postLoadEvents[name](target);
                }

                mediator.emit('modules:commercial/loader:loaded');
            },
            error: function (req) {
                mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'common/modules/commercial/loader.js');
            }
        }).load();

        return this;
    };

    /**
     * @param {String}  name
     * @param {Element} el
     */
    Loader.prototype.init = function(name, el) {

        if(this.components[name] === undefined) {
            mediator.emit('module:error', 'Unknown commercial component: ' + name, 'common/modules/commercial/loader.js');
            return false;
        }

        return this.load(name, el);
    };

    return Loader;
});
