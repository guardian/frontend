define(['common', 'modules/detect', 'vendor/bean-0.4.11-1'], function(common, detect, bean) {

    // https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview

    function Omniture(s, config) {

        var config = config,
            s = s,
            that = this;

        this.logView = function() {
            s.t();
        }
 
        this.logTag = function(params) {

            var tag = params[0],
                isXhr = params[1],
                isInternalAnchor = params[2];

            delay = (isXhr || isInternalAnchor) ? false : true;

            that.populateEventProperties(s, tag);
            
            s.tl(delay, 'o', tag);
        }
    
        this.populateEventProperties = function(tag){
            s.linkTrackVars = 'eVar37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = s.pageType + ' | ' + tag;
        }

        this.populatePageProperties = function() {
       
            s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com';
        
            var webTitle = (config.page.webTitle || '').trim();
            if (webTitle.length > 72) {
                webTitle = webTitle.substring(0, 72);
            }
            s.pageName  = webTitle + ':' + (config.page.contentType || '') + ':' + (config.page.pageCode || '');
              
            s.pageType  = config.page.contentType || '';  //pageType
            s.prop9     = config.page.contentType || '';  //contentType
              
            s.channel   = config.page.section || '';
            s.prop4     = config.page.keywords || '';
            s.prop6     = config.page.author || '';
            s.prop8     = config.page.pageCode || '';
            s.prop10    = config.page.tones || '';

            s.prop11    = config.page.section || ''; //Third Level Mlc
            s.prop13    = config.page.series || '';
            s.prop25    = config.page.blogs || '';
                  
            s.prop14    = config.page.buildNumber || '';
              
            var platform = "frontend";
            s.prop19     = platform;
            s.eVar19     = platform;
                   
            s.prop47    = config.page.edition || '';

            s.prop48    = detect.getConnectionSpeed();

            s.prop56    = detect.getLayoutMode();
        
            if (config.page.webPublicationDate) {
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }
            
            return s;
        }

        this.init = function() {

            // must be set before the Omniture file is parsed
            s_account = config.page.omnitureAccount;
    
            var that = this;

            require(['omniture'], function(placeholder){
                that.populatePageProperties(window.s);
                that.logView();
                common.mediator.on('modules:clickstream:click', that.logTag )
            });
        }    
     
    }
    
    return Omniture;

});

