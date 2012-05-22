s_account = 'guardiangu-mobiledev';

require(['http://static.guim.co.uk/static/ad0511f704894b072867e61615a7d577d265dd03/common/scripts/omniture-H.24.1.1.js']
    , function(omniture){

        s.pageName = document.title + ':' + (guardian.page.contentType || '') + ':' + (guardian.page.pageId || ''); //TODO limit length

        s.pageType = guardian.page.contentType || '';  //pageType
        s.prop9 = guardian.page.contentType || '';     //contentType

        s.channel = guardian.page.section || '';
        s.prop4 = guardian.page.keywords || '';
        s.prop6 = guardian.page.author || '';
        s.prop8 = guardian.page.pageId || '';
        s.prop10 = guardian.page.tones || '';

        s.prop11 = guardian.page.section || ''; //Third Level Mlc
        s.prop13 = guardian.page.series || '';
        s.prop25 = guardian.page.blogs || '';

        //this fires off the omniture tracking
        s.t();

        function findComponentName(element){
            var tag = element.tagName.toLowerCase();
            if (tag === 'body') {
                return null;
            }
            var componentName = element.getAttribute("data-component-name");
            if (componentName) {
                return componentName;
            }
            return findComponentName(element.parentNode)
        }

        document.body.addEventListener("click", function(event){
            var element = event.srcElement;

            if (element.tagName.toLowerCase() != "a") {
                return;
            }

            var componentName = findComponentName(element);

            if(componentName) {
                s.linkTrackVars = 'eVar7,eVar37,events';
                s.linkTrackEvents = 'event37';
                s.eVar37=componentName;
                s.eVar7=s.pageName;
                s.events='event37';

                var linkHref = element.getAttribute('href');
                var delay = (linkHref && (linkHref.indexOf('#') === 0 || linkHref.indexOf('javascript') === 0)) ? true : this;
                s.tl(delay,'o',componentName);
            }
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
