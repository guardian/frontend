define(['common', 'vendor/bean-0.4.11-1', 'bonzo', 'qwery'], function (common, bean, bonzo, qwery) {

    /*

        expects following HTML structure

        <ol class="tabs">
            <li class="tabs-selected"><a href="#foo" data-tabs-container="tabs-test">Foo</a></li>
            <li><a href="#bar" data-tabs-container="tabs-test">Bar</a></li>
        </ol>

        <div class="tabs-content" id="tabs-test">
             <div class="tabs-pane" id="foo">foo</div>
             <div class="tabs-pane initially-off" id="bar">bar</div>
        </div>
    
    */

    function bind(tab) {
        var href = tab.getAttribute('href');
        href = href.substring(1); // trim the leading #
        var paneToShow = document.getElementById(href);
        var tabContainer = document.getElementById(tab.getAttribute('data-tabs-container'));
        
        if (paneToShow && tabContainer) {
            bean.add(tab, 'click', function(e) {

                var tabParent = bonzo(tab).parent();
                var selectedTab = qwery('li.tabs-selected', bonzo(tabParent).parent());
                var allPanes = qwery('.tabs-panel', tabContainer);
                
                bonzo(selectedTab).removeClass('tabs-selected')
                bonzo(tabParent).addClass('tabs-selected');

                bonzo(allPanes).hide();
                bonzo(paneToShow).removeClass('initially-off').show();
                
                e.preventDefault(); // stop # anchoring
            });
        }
    }

    function init() {
        var tabs = common.$g('.tabs li a');
    
        for (var i in tabs) {
            var t = tabs[i];
            bind(t);
        }
    }

    return {
        init: init
    }

});