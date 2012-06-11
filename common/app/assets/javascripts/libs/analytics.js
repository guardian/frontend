s_account = guardian.page.omnitureAccount;

require([
    'http://static.guim.co.uk/static/ad0511f704894b072867e61615a7d577d265dd03/common/scripts/omniture-H.24.1.1.js',
    guardian.page.ophanScript,
    guardian.js.modules.detect,
    "bean"
    ], 
    function (omniture, ophan, detect, bean) {

        s.linkInternalFilters += ',localhost,gucode.co.uk,gucode.com,guardiannews.com';

        var webTitle = (guardian.page.webTitle || '').trim();
        if (webTitle.length > 72) {
            webTitle = webTitle.substring(0, 72);
        }
        s.pageName  = webTitle + ':' + (guardian.page.contentType || '') + ':' + (guardian.page.pageCode || '');

        s.pageType  = guardian.page.contentType || '';  //pageType
        s.prop9     = guardian.page.contentType || '';     //contentType

        s.channel   = guardian.page.section || '';
        s.prop4     = guardian.page.keywords || '';
        s.prop6     = guardian.page.author || '';
        s.prop8     = guardian.page.pageCode || '';
        s.prop10    = guardian.page.tones || '';

        s.prop11    = guardian.page.section || ''; //Third Level Mlc
        s.prop13    = guardian.page.series || '';
        s.prop25    = guardian.page.blogs || '';

        s.prop14    = guardian.page.buildNumber || '';

        s.prop47    = guardian.page.edition || '';

        s.prop48    = detect.getConnectionSpeed();

        s.prop56    = detect.getLayoutMode();

        if (guardian.page.webPublicationDate) {  //at the moment we have web pub date for content and nothing else
            s.prop30 = 'content';
        } else {
            s.prop30 = 'non-content';
        }

        //this fires off the omniture tracking
        s.t();

        function findComponentName(element, trackingName){
            var tag = element.tagName.toLowerCase();
            if (tag === 'body') {
                return trackingName;
            }
            var componentName = element.getAttribute("data-link-name");
            if (componentName) {
                if (trackingName != '') {
                    trackingName = componentName + ' | ' + trackingName;
                } else {
                    trackingName = componentName;
                }
            }

            //TODO parentNode is not cross browser compatible
            return findComponentName(element.parentNode, trackingName)
        }

        bean.add(document.body, "click", function(event){

            var element = event.target;
            if (element.tagName.toLowerCase() != "a") {
                return;
            }

            //we never want to see 'unknown' in our stats
            //if you can click it, it needs to be tracked...
            var componentName = findComponentName(element, '');

            if (componentName == '') {
                componentName = 'unknown';
            }

            var isAjaxLink = element.getAttribute("data-is-ajax");

            var linkHref = element.getAttribute('href');
            var shouldDelay = (linkHref && (linkHref.indexOf('#') === 0 || linkHref.indexOf('javascript') === 0)) ? true : this;
            if (isAjaxLink == "true") {
                shouldDelay = false;
            }
            s.tl(shouldDelay,'o',componentName);

        });


});

//TODO still need to figure out what to do with this data
//        s.server='02';                            NOT SURE WE CAN DO THIS AT THE MOMENT
//        s.prop2='GUID:(none)';
//
//
//        s.prop3= "GU.co.uk";                     PUBLICATION
//        s.prop5 = "Not commercially useful";
//        s.prop7 = "12-May-22";
//        s.prop30 = "content";
//        s.prop42 = "News";                       NO HANDLE ONTO ZONE IN API
//        s.prop47 = "UK";
//
//        s.hier2="GU/News/UK news/Crime";
//
//        s.eVar23="";                             USED FOR COMPETITION SUBMISSION
