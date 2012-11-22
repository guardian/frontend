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
    'domwrite',

    'modules/detect',
    'modules/adverts/audience-science'
], function (
    common,
    reqwest,
    domwrite,

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
        //var oasUrl = this.config.oasUrl + 'adstream_[REQUEST_TYPE].ads/' + this.config.oasSiteId + '/[RANDOM]@' + '[SLOT_NAME]' + '[QUERY]';
        var oasUrl = 'http://b7wh.t.proxylocal.com/' + 'adstream_[REQUEST_TYPE].ads/' + this.config.oasSiteId + '/[RANDOM]@' + '[SLOT_NAME]' + '[QUERY]';
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
        url = url.replace('[RANDOM]', Math.random().toString().substring(2,11));
        url = url.replace('[SLOT_NAME]', this.name);
        url = url.replace('[REQUEST_TYPE]', type);
        url = url.replace('[QUERY]', query);

        return url;
    };

    DocWriteAdSlot.prototype.setDimensions = function(dimensions) {
        this.dimensions = dimensions;
    };

    DocWriteAdSlot.prototype.render = function () {
         try {
            OAS_RICH(this.name);
            var slot = this.el;
            domwrite.render(slot);
         } catch(e) {
             common.mediator.emit('module:error', e, 'document-write.js');
        }
    };

    DocWriteAdSlot.prototype.load = function(url) {
        var oasUrl = url || this.generateUrl(),
            that = this;

        console.log(oasUrl);

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