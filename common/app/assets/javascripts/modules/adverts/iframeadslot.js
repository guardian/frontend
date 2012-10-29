/*  IframeAdslot
    
    An Adslot class needs takes two constructor arguments:
        - It's name
        - It's containing element.

    It must implement one public method.
        - load();

        When you call load, it sticks stuff in its containing element.

*/


define(['common', 'modules/detect' ], function (common, detect) {

    var IframeAdSlot = function(name, el, config) {
        this.name = name;
        this.el = el;
        this.loaded = false;
        // Why is this here?
        this.config = config;
    };

    IframeAdSlot.prototype.load = function() {
        this.loaded = true;
        this.createIframe();
    };

    IframeAdSlot.prototype.createIframe = function() {
        // Create an iframe to insert in the slot.
        var frame = document.createElement('iframe');
        frame.src = this.generateUrl();
        frame.setAttribute('class', 'ad');
        frame.setAttribute('marginheight', '0px');
        frame.setAttribute('marginwidth', '0px');
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('seamless', 'seamless');
        frame.width = this.dimensions.width;
        frame.height = this.dimensions.height;

        // Append it to the containing el.
        this.el.appendChild(frame);
    };

    IframeAdSlot.prototype.generateUrl = function() {
        var oasUrl = this.config.oasUrl + 'adstream_[REQUEST_TYPE].ads/' + this.config.oasSiteId + '/12345@' + '[SLOT_NAME]' + '[QUERY]';
        var type = (detect.getConnectionSpeed() === 'low') ? 'nx' : 'sx';
        var query = '?';

        if (this.config.keywords) {
            var keywords = this.config.keywords.split(',');
            for(var i = 0, j = keywords.length; i < j; i++) {
                query += 'k=' + encodeURIComponent(keywords[i]);
            }
        }

        query += '&ct=' + encodeURIComponent(this.config.contentType.toLowerCase());
        query += '&pt=' + encodeURIComponent(this.config.contentType.toLowerCase());
        query += '&cat=' + encodeURIComponent(this.config.section.toLowerCase());

        var url = oasUrl;
        url = url.replace('[SLOT_NAME]', this.name);
        url = url.replace('[REQUEST_TYPE]', type);
        url = url.replace('[QUERY]', query);

        return url;
    };

    IframeAdSlot.prototype.setDimensions = function(dimensions) {
        this.dimensions = dimensions;
    };

    return IframeAdSlot;

});