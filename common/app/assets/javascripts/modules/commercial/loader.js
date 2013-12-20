/*
    Module: commercial/loader.js
    Description: Loads our commercial components
*/
define([
    '$',
    'utils/mediator',
    'utils/storage',
    'modules/lazyload',
    'modules/component',
    'modules/onward/history'
], function (
    $,
    mediator,
    storage,
    LazyLoad,
    Component,
    History
) {

    /**
     * Loads commercial components.
     *
     * BEWARE that this code is depended upon by the ad server. 
     * 
     * ```
     * require(['modules/commercial/loader'], function (CommercialComponent) {
     *   var slot = document.querySelector('[class="js-sticky-upper"]');
     *    var c = new CommercialComponent({config: guardian, oastoken: '%%C%%?'}).travel(slot);
     * })
     * ```
     * 
     * @constructor
     * @extends Component
     * @param {Object=} options
     */
    var Loader = function(options) {
        var conf = options.config.page || {};
        this.keywords       = conf.keywords || '';
        this.section        = conf.section;
        this.host           = conf.ajaxUrl + '/commercial/';
        this.oastoken       = options.oastoken || '';
        this.userSegments   = 'seg=' + (new History().getSize() <= 1 ? 'new' : 'repeat');
        this.components     = {
          masterclasses: this.host + 'masterclasses.json?' + this.userSegments + '&s=' + this.section,
          travel:        this.host + 'travel/offers.json?' + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
          jobs:          this.host + 'jobs.json?' + this.userSegments + '&s=' + this.section + '&' + this.getKeywords(),
          soulmates:     this.host + 'soulmates/mixed.json?' + this.userSegments + '&s=' + this.section
        };
        return this;
    };

    Component.define(Loader);

    Loader.prototype.getKeywords = function() {
        return this.keywords.split(',').map(function(keyword){
           return 'k=' + encodeURIComponent(keyword.replace(/\s/g, "-").toLowerCase());
        }).join('&');
    };

    /**
     * @param {Element}  target
     */
    Loader.prototype.load = function(url, target) {
        var self = this;
        new LazyLoad({
            url: url,
            container: target,
            beforeInsert: function (html) {
                return html.replace(/%OASToken%/g, self.oastoken);
            },
            success: function () {
                mediator.emit('modules:commercial/loader:loaded');
            },
            error: function (req) {
                mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'modules/commercial/loader.js');
            }
        }).load();
        return this;
    };
    
    Loader.prototype.travel = function(el) {
        return this.load(this.components.travel, el);
    };
    
    Loader.prototype.masterclasses = function(el) {
        return this.load(this.components.masterclasses, el);
    };
    
    Loader.prototype.jobs = function(el) {
        return this.load(this.components.jobs, el);
    };
    
    Loader.prototype.soulmates = function(el) {
        return this.load(this.components.soulmates, el);
    };

    return Loader;
});
