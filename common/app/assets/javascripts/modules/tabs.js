define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    /*
        expects the following HTML structure

        <div class="tabs {tabs-fixable}">
            <ol class="tabs__container js-tabs">
                <li class="tabs__tab tabs__tab--selected"><a class="tabs__link" href="#foo">Foo</a></li>
                <li class="tabs__tab"><a class="tabs__link" href="#bar">Bar</a></li>
            </ol>

            <div class="tabs__content">
                 <div class="tabs__pane" id="foo">foo</div>
                 <div class="tabs__pane js-hidden" id="bar">bar</div>
            </div>
        </div>
    */

    var Tabs = function () {

        var view = {

            showTab: function (container, clickedTab, originalEvent) {

                // find the active tab in the set. returns an array of 1 item, hence [0]
                var currentTab = common.$g('.tabs__tab--selected a', container)[0];

                // trim the leading # and find the matching panel element
                var paneToShow = container.querySelector('#' + clickedTab.getAttribute('href').substring(1));
                var paneToHide = container.querySelector('#' + currentTab.getAttribute('href').substring(1));

                // show hide stuff
                bonzo(currentTab.parentNode).removeClass('tabs__tab--selected');
                bonzo(clickedTab.parentNode).addClass('tabs__tab--selected');
                bonzo(paneToHide).hide();
                bonzo(paneToShow).removeClass('js-hidden').show().focus();

                // only do this if we know the href was a tab ID, not a URL
                originalEvent.preventDefault();
            }
        };

        this.init = function (context) {

            Array.prototype.forEach.call(context.querySelectorAll('.tabs'), function(container) {

                var tabSet = common.$g('ol.js-tabs', container)[0],
                    tabSetHeight = 0,
                    vPos = 0,
                    vHeight = 0,
                    vScroll = 0,
                    vFixed = false;

                if(tabSet) {

                    if(tabSet.getAttribute('data-is-bound') === true) {
                        return false;
                    }

                    tabSetHeight = bonzo(tabSet).offset().height;
                    vPos = bonzo(tabSet).offset().top;

                    bean.add(tabSet, 'click', function (e) {
                        var targetElm = e.target;
                        // verify they clicked an <a> element
                        if (targetElm.nodeName.toLowerCase() === "a") {
                            view.showTab(container, targetElm, e);
                            vHeight = bonzo(container).offset().height - tabSetHeight;
                            if (vScroll > vPos) {
                                window.scrollTo(0, vPos);
                            }
                        }
                    });

                    if (bonzo(container).hasClass('tabs--fixable')) {

                        vHeight = bonzo(container).offset().height - tabSetHeight;

                        bean.add(window, 'scroll', function (e) {
                            vScroll = window.pageYOffset || document.documentElement.scrollTop;

                            if( !vFixed && vScroll >= vPos && vScroll <= vPos + vHeight ) {
                                bonzo(tabSet).addClass('tabs--fixed');
                                vFixed = true;
                            } else if( vFixed && (vScroll < vPos || vScroll > vPos + vHeight)) {
                                bonzo(tabSet).removeClass('tabs--fixed');
                                vFixed = false;
                            }
                        });
                    }
        
                    tabSet.setAttribute('data-is-bound', true);
                }
            });
        };
    };

    return Tabs;

});
