define(['common', 'reqwest', 'domwrite'], function (common, reqwest, domwrite) {
 
    var DocWrite = function (config) {

        domwrite.capture(); // TODO move to init
        
        var config = config,
            buffer;

        this.getPageUrl = function(){
            return 'm.guardian.co.uk/' + config.page.pageId + '/oas.html'
        }

        this.getKeywords = function() {
            return config.page.keywords.split(',').map(function(keyword){
                return 'k=' + encodeURIComponent(keyword.toLowerCase())
            }).join('&')
        } 
    
        this.getPageType = function() {
            return config.page.contentType.toLowerCase();
        }

        this.getCategory = function() {
            return config.page.section.toLowerCase();
        }
        
        this.render = function () {
            OAS_RICH('Top2'); // TODO need to be slot aware 
            var slot = document.getElementById('ad-slot-top-banner-ad'); // ad-slot-top-banner-ad
            domwrite.render(slot);
        }

        this.getOasUrl = function() {
            return config.page.oasUrl + 
               'adstream_mjx.ads/' + 
                this.getPageUrl() + '/' +
                Math.random().toString().substring(2,11) + '@Top2,Bottom2' +
                '?' + this.getKeywords() + 
                '&pt=' + this.getPageType() + 
                '&ct=' + this.getPageType();
        }
        
        this.load = function(url) {
            var oasUrl = this.getOasUrl();
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
        }

        common.mediator.on('modules:adverts:docwrite:loaded', this.render);
    }

    return DocWrite;
    
});
