/*
    An Adslot class needs takes two constructor arguments:
        - It's name
        - It's containing element.

    It must implement one public method.
        - load();
*/
define([
    'common',
    'reqwest',

    'modules/detect',
    'modules/adverts/audience-science'
], function (
    common,
    reqwest,

    detect,
    audienceScience
) {

    var DocWriteAdSlot = function(name, el, config) {
        this.name = name;
        this.el = el;
        this.loaded = false;
        this.config = config;
    };

    DocWriteAdSlot.prototype.generateUrl = function() {
        var oasUrl = this.config.oasUrl + 'adstream_[REQUEST_TYPE].ads/' + this.config.oasSiteId + '/12345@' + '[SLOT_NAME]' + '[QUERY]';
        var type = (detect.getConnectionSpeed() === 'low') ? 'nx' : 'mjx';
        var query = '?';

        if (this.config.keywords) {
            var keywords = this.config.keywords.split(',');
            for(var i = 0, j = keywords.length; i < j; ++i) {
                query += 'k=' + encodeURIComponent(keywords[i]) + "&";
            }
        }

        var segments = audienceScience.getSegments();
        if (segments) {
            for (var k = 0, l = segments.length; k<l; ++k) {
                query += "a=" + segments[k] + "&";
            }
        }

        if (this.config.contentType) {
             query += 'ct=' + encodeURIComponent(this.config.contentType.toLowerCase()) + "&";
             query += 'pt=' + encodeURIComponent(this.config.contentType.toLowerCase()) + "&";
        }
        if (this.config.section) {
            query += 'cat=' + encodeURIComponent(this.config.section.toLowerCase()) + "&";
        }

        var url = oasUrl;
        url = url.replace('[SLOT_NAME]', this.name);
        url = url.replace('[REQUEST_TYPE]', type);
        url = url.replace('[QUERY]', query);

        return url;
    };

    DocWriteAdSlot.prototype.setDimensions = function(dimensions) {
        this.dimensions = dimensions;
    };

    DocWriteAdSlot.prototype.render = function () {
        OAS_RICH(this.name);
        var slot = document.querySelector(this.el);
        domwrite.render(slot);
    };

    DocWriteAdSlot.prototype.load = function(url) {
        var oasUrl = url || this.generateUrl(),
            that = this;

        reqwest({
            url: oasUrl,
            type: 'jsonp',
            success: function (js) {
                that.loaded = true;
                that.render();
            },
            error: function () {
                common.mediator.emit('module:error', 'Failed to load adverts', 'document-write.js');
            }
        });
    };

    return DocWriteAdSlot;

});



define(['common', 'reqwest', 'domwrite', 'modules/adverts/audience-science'], function (common, reqwest, domwrite, audienceScience) {
 
    var DocWrite = function (config) {

        domwrite.capture(); // TODO move to init
        
        var buffer;

        this.getPageUrl = function(){
            return 'm.guardian.co.uk/' + config.page.pageId + '/oas.html';
        };

        this.getAudienceScience = function() {
           return audienceScience.getSegments().map(function(segment) {
              return "&a=" + segment;
              }).join('');
        };

        this.getKeywords = function() {
            var keywords = config.page.keywords.split(',').map(function(keyword){
                return 'k=' + encodeURIComponent(keyword.toLowerCase());
            }).join('&');
            return (keywords) ? keywords : false;
        };
    
        this.getPageType = function() {
            return config.page.contentType.toLowerCase();
        };

        this.getCategory = function() {
            if (config.page.section) {
                return config.page.section.toLowerCase();
            }
        };

        this.render = function () {
            OAS_RICH('Top2'); // TODO need to be slot aware
            var slot = document.getElementById('ad-slot-top-banner-ad'); // ad-slot-top-banner-ad
            domwrite.render(slot);
        };

        this.getOasUrl = function() {
            return config.page.oasUrl +
               'adstream_mjx.ads/' +
                this.getPageUrl() + '/' +
                Math.random().toString().substring(2,11) + '@Top2,Bottom2' +
                '?' + this.getKeywords() +
                '&pt=' + this.getPageType() +
                '&ct=' + this.getPageType() +
                '&cat=' + this.getCategory() +
                this.getAudienceScience();
        };
        
        this.load = function(url) {
            var oasUrl = url || this.getOasUrl();
            reqwest({
                url: oasUrl,
                type: 'jsonp',
                success: function (js) {
                    common.mediator.emit('modules:adverts:docwrite:loaded');
                },
                error: function () {
                    common.mediator.emit('module:error', 'Failed to load adverts', 'document-write.js');
                }
            });
        };

        common.mediator.on('modules:adverts:docwrite:loaded', this.render);
    };

    return DocWrite;
    
});
