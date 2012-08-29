define(['modules/detect', 'vendor/bean-0.4.11-1'], function(detect, bean) {

    function Analytics(){

        //loads the analytics modules
        this.submit = function(config){
            Omniture(config);
        };

        //just here to be called from tests
        this.setup = function(config, detect, s){
            setupData(config, detect, s);
        };

        //just here to be called from tests
        this.clickEvent = function(event, config, s){
            recordClick(event, config, s);
        };
    }

    //https://developer.omniture.com/en_US/content_page/sitecatalyst-tagging/c-tagging-overview
    function Omniture(config){
        //s_account is the name of a page scope variable that must
        //be set before the Omniture file is parsed
        s_account = config.page.omnitureAccount;

        require(['omniture'], function(placeholder){

            //s is available to us after the Omniture script has run
            setupData(config, detect, s);

            //this is the bit that does the actual call to Omniture
            s.t();

            //setup click tracking
            bean.add(document.body, "click", function(event){ recordClick(event, config, s); })
        });
    }

    function findComponentName(element, trackingName){
        var tag = element.tagName.toLowerCase();
        if (tag === 'body') {
            return trackingName;
        }
        var componentName = element.getAttribute("data-link-name");
        if (componentName) {
            if (trackingName == '') {
                trackingName = componentName
            } else {
                trackingName = componentName + ' | ' + trackingName;
            }
        }

        return findComponentName(element.parentNode, trackingName)
    }

    function isInsideLink(element) {
        var tagName = element.tagName.toLowerCase();
        if (tagName == 'body') return false;
        if (tagName == 'a') return true;

        return isInsideLink(element.parentNode);
    }

    function recordClick(event, config, s){

        var element = event.target;
        if (!isInsideLink(element)) {
            return;
        }
        var componentName = config.page.contentType + " | " + findComponentName(element, '');

        var isAjaxLink = element.getAttribute("data-is-ajax");

        var linkHref = element.getAttribute('href');
        var shouldDelay = (linkHref && (linkHref.indexOf('#') === 0 || linkHref.indexOf('javascript') === 0)) ? true : this;
        if (isAjaxLink == "true") {
            shouldDelay = false;
        }

        s.linkTrackVars = 'eVar37,events';
        s.linkTrackEvents = 'event37';
        s.events = 'event37';
        s.eVar37 = componentName;

        s.tl(shouldDelay,'o',componentName);
    }

    function setupData(config, detect, s) {

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

    return Analytics;
});
