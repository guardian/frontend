define(['common', 'modules/detect', 'bean'], function(common, detect, bean) {

    // https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview

    function Omniture(s, config) {

        var that = this;

        this.logView = function() {
            s.t();
        };
 
        this.logTag = function(params) {
            var tag = params[0],
                isXhr = params[1],
                isInternalAnchor = params[2];

            // this is confusing: if s.tl() first param is "true" then it *doesn't* delay.
            var delay = (isXhr || isInternalAnchor) ? true : false;
            that.populateEventProperties(tag);
            
            s.tl(delay, 'o', tag);
        };
    
        this.populateEventProperties = function(tag){
            s.linkTrackVars = 'eVar37,events';
            s.linkTrackEvents = 'event37';
            s.events = 'event37';
            s.eVar37 = s.pageType + ' | ' + tag;
        };

        this.populatePageProperties = function() {
       
            s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com,int.gnl,proxylocal.com';
        
            var prefix = 'GFE',
                path = window.location.pathname;
            
            s.pageName  = config.page.analyticsName;
              
            s.pageType  = config.page.contentType || '';  //pageType
            s.prop9     = config.page.contentType || '';  //contentType
              
            s.channel   = config.page.section || '';
            s.prop4     = config.page.keywords || '';
            s.prop6     = config.page.author || '';
            s.prop7     = config.page.webPublicationDate || '';
            s.prop8     = config.page.pageCode || '';
            s.prop9     = config.page.contentType || '';
            s.prop10    = config.page.tones || '';

            s.prop13    = config.page.series || '';
            s.prop25    = config.page.blogs || '';
                  
            s.prop14    = config.page.buildNumber || '';
              
            var platform = "frontend";
            s.prop19     = platform;
            s.eVar19     = platform;

            s.prop31    = 'Guest user';
                  
            s.prop47    = config.page.edition || '';

            s.prop48    = detect.getConnectionSpeed();

            s.prop56    = detect.getLayoutMode();
        
            if (config.page.webPublicationDate) {
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }

        };

        this.init = function() {

            // must be set before the Omniture file is parsed
            window.s_account = config.page.omnitureAccount;
    
            var that = this;

            // if the omniture object was not injected in to the constructor
            // use the global 's' object

            if (s !== null) {
                that.populatePageProperties();
                that.logView();
                common.mediator.on('module:clickstream:click', that.logTag );
            } else {
                require(['omniture'], function(placeholder){
                    s = window.s;
                    that.populatePageProperties();
                    that.logView();
                    common.mediator.on('module:clickstream:click', that.logTag );
                });
            }
        };
     
    }
    
    return Omniture;

});

