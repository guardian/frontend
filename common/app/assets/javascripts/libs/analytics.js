//Omniture requires this to be set during the script load
s_account = guardian.page.omnitureAccount;

var loadAnalytics = function () {

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
            s.pageName = webTitle + ':' + (guardian.page.contentType || '') + ':' + (guardian.page.pageCode || '');

            s.pageType = guardian.page.contentType || '';  //pageType
            s.prop9 = guardian.page.contentType || '';     //contentType

            s.channel = guardian.page.section || '';
            s.prop4 = guardian.page.keywords || '';
            s.prop6 = guardian.page.author || '';
            s.prop8 = guardian.page.pageCode || '';
            s.prop10 = guardian.page.tones || '';

            s.prop11 = guardian.page.section || ''; //Third Level Mlc
            s.prop13 = guardian.page.series || '';
            s.prop25 = guardian.page.blogs || '';

            s.prop14 = guardian.page.buildNumber || '';

            s.prop47 = guardian.page.edition || '';

            s.prop48 = detect.getConnectionSpeed();

            s.prop56 = detect.getLayoutMode();

            if (guardian.page.webPublicationDate) {  //at the moment we have web pub date for content and nothing else
                s.prop30 = 'content';
            } else {
                s.prop30 = 'non-content';
            }

            //this fires off the omniture tracking
            s.t();

            function findComponentName(element, trackingName) {
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

                //TODO parentNode is not cross browser compatible
                return findComponentName(element.parentNode, trackingName)
            }

            function isInsideLink(element) {
                var tagName = element.tagName.toLowerCase();
                if (tagName == 'body') return false;
                if (tagName == 'a') return true;

                //TODO parentNode is not cross browser compatible
                return isInsideLink(element.parentNode);
            }

            bean.add(document.body, "click", function (event) {

                var element = event.target;
                if (!isInsideLink(element)) {
                    return;
                }
                var componentName = guardian.page.contentType + " | " + findComponentName(element, '');

                var isAjaxLink = element.getAttribute("data-is-ajax");

                var linkHref = element.getAttribute('href');
                var shouldDelay = (linkHref && (linkHref.indexOf('#') === 0 || linkHref.indexOf('javascript') === 0)) ? true : this;
                if (isAjaxLink == "true") {
                    shouldDelay = false;
                }
                s.tl(shouldDelay, 'o', componentName);
            });
        });
}

require([guardian.js.modules["$g"]], function ($g) {
    $g.onReady(loadAnalytics);
});
