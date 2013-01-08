define(['common', 'bean', 'bonzo', 'qwery'], function (common, bean, bonzo, qwery) {

    /*
        expects the following HTML structure

        <ol class="tabs">
            <li class="tabs-selected"><a href="#foo">Foo</a></li>
            <li><a href="#bar">Bar</a></li>
        </ol>

        <div class="tabs-content">
             <div class="tabs-pane" id="foo">foo</div>
             <div class="tabs-pane js-hidden" id="bar">bar</div>
        </div>

    */

    var Tabs = function (options) {

        var view = {

            showTab: function (tabSet, clickedTab, originalEvent) {

                // find the active tab in the set. returns an array of 1 item, hence [0]
                var currentTab = common.$g('.tabs-selected a', tabSet)[0];

                // trim the leading # and find the matching panel element
                var paneToShow = document.getElementById(clickedTab.getAttribute('href').substring(1));
                var paneToHide = document.getElementById(currentTab.getAttribute('href').substring(1));

                // show hide stuff
                bonzo(currentTab.parentNode).removeClass('tabs-selected');
                bonzo(clickedTab.parentNode).addClass('tabs-selected');
                bonzo(paneToHide).hide();
                bonzo(paneToShow).removeClass('js-hidden').show();

                // only do this if we know the href was a tab ID, not a URL
                originalEvent.preventDefault();

            }
        };

        this.init = function (tabSelector) {

            if (!tabSelector) {
                tabSelector = 'ol.tabs';
            }

            var ols = common.$g(tabSelector).each(function (tabSet) {
                bean.add(tabSet, 'click', function (e) {
                    var targetElm = e.target;
                    // if we use tabSet instead of this, it sets all tabs to use the last set in the loop
                    var tabContainer = targetElm.parentNode.parentNode;
                    // verify they clicked an <a> element
                    if (targetElm.nodeName.toLowerCase() === "a") {
                        view.showTab(tabContainer, targetElm, e);
                    }
                });
            });
        };

        // Bindings

        common.mediator.on('modules:tabs:render', this.init);

    };

    return Tabs;

});
