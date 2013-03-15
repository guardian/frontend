define(['common', 'bean', 'bonzo', 'qwery'], function (common, bean, bonzo, qwery) {

    /*
        expects the following HTML structure

        <ol class="tabs js-tabs">
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

                return bonzo(paneToShow).offset().height;
            }
        };

        this.init = function (tabSelector) {

            if (!tabSelector) {
                tabSelector = 'ol.js-tabs';
            }

            var ols = common.$g(tabSelector).each(function (tabSet) {

                var vPos = bonzo(tabSet).offset().top,
                    vFixed = false,
                    vHeight = 0,
                    vScroll = 0,
                    containerEl;

                if(tabSet.getAttribute('data-is-bound') === true) {
                    return false;
                }

                bean.add(tabSet, 'click', function (e) {
                    var targetElm = e.target;
                    // if we use tabSet instead of this, it sets all tabs to use the last set in the loop
                    var tabContainer = targetElm.parentNode.parentNode.parentNode; // Horrible!
                    // verify they clicked an <a> element
                    if (targetElm.nodeName.toLowerCase() === "a") {
                        vHeight = view.showTab(tabContainer, targetElm, e);
                    }
                    if (vScroll > vPos) {
                        window.scrollTo(0, vPos);
                    }
                });

                if (bonzo(tabSet.parentNode).hasClass('tabs-fixable')) {

                    // Assumes 1st visible tab pane is associated with this tabset. So doesn't yet support pages with multiple tabs
                    containerEl = document.querySelector('.tabs-pane:not(.js-hidden)');

                    if (containerEl) {
                        vHeight = bonzo(containerEl).offset().height;

                        bean.add(window, 'scroll', function (e) {
                            vScroll = window.pageYOffset || document.documentElement.scrollTop;

                            if( !vFixed && vScroll >= vPos && vScroll <= vPos+vHeight ) {
                                bonzo(tabSet).addClass('tabs-fix');
                                vFixed = true;
                            } else if( vFixed && (vScroll < vPos || vScroll > vPos+vHeight)) {
                                bonzo(tabSet).removeClass('tabs-fix');
                                vFixed = false;
                            }
                        });
                    }
                }
    
                tabSet.setAttribute('data-is-bound', true);
            });
        };

        // Bindings
        common.mediator.on('modules:tabs:render', this.init);

    };

    return Tabs;

});
