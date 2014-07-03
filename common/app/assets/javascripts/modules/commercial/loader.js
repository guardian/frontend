/*
    Module: commercial/loader.js
    Description: Loads our commercial components
*/
define([
    'bonzo',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/storage',
    'common/modules/lazyload',
    'common/modules/component',
    'bean',
    'common/modules/ui/tabs'
], function (
    bonzo,
    $,
    mediator,
    storage,
    LazyLoad,
    Component,
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
        this.keywordIds         = conf.keywordIds || '';
        this.section            = conf.section;
        this.host               = conf.ajaxUrl + '/commercial/';
        this.desktopUserVariant = conf.ab_commercialInArticleDesktop || '';
        this.mobileUserVariant  = conf.ab_commercialInArticleMobile || '';
        this.oastoken           = options.oastoken || '';
        this.adType             = options.adType || 'desktop';
        this.components         = {
            bestbuy:           this.host + 'money/bestbuys.json',
            bestbuyHigh:       this.host + 'money/bestbuys-high.json',
            book:              this.host + 'books/book/' + this.pageId + '.json',
            books:             this.host + 'books/bestsellers.json?'        + this.getKeywords(),
            booksMedium:       this.host + 'books/bestsellers-medium.json?' + this.getKeywords(),
            booksHigh:         this.host + 'books/bestsellers-high.json?'   + this.getKeywords(),
            jobs:              this.host + 'jobs.json?'                     + this.getKeywords(),
            jobsHigh:          this.host + 'jobs-high.json?'                + this.getKeywords(),
            masterclasses:     this.host + 'masterclasses.json?'            + this.getKeywords(),
            masterclassesHigh: this.host + 'masterclasses-high.json?'       + this.getKeywords(),
            soulmates:         this.host + 'soulmates/mixed.json',
            soulmatesHigh:     this.host + 'soulmates/mixed-high.json',
            travel:            this.host + 'travel/offers.json?'            + 's=' + this.section + '&' + this.getKeywords(),
            travelHigh:        this.host + 'travel/offers-high.json?'       + 's=' + this.section + '&' + this.getKeywords()
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

    Loader.prototype.getKeywords = function () {
        if (this.keywordIds) {
            return this.keywordIds.split(',').map(function (keywordId) {
                return 'k=' + encodeURIComponent(keywordId.split('/').pop());
            }).join('&');
        } else {
            return 'k=' + this.pageId.split('/').pop();
        }
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
