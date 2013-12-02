define([
    'common',
    'bean',
    'bonzo',
    'qwery'
], function (
    common,
    bean,
    bonzo,
    qwery
) {

    /*
        expects the following HTML structure

        <div class="tabs">
            <ol class="tabs__container js-tabs" role="tablist">
                <li id="foo-tab" class="tabs__tab tabs__tab--selected" role="tab" aria-selected="true" aria-controls="foo"><a href="#foo">Foo</a></li>
                <li id="bar-tab" class="tabs__tab" role="tab" aria-selected="false" aria-controls="bar"><a href="#bar">Bar</a></li>
            </ol>

            <div class="tabs__content">
                 <div class="tabs__pane" id="foo" role="tabpanel" aria-labelledby="foo-tab">foo</div>
                 <div class="tabs__pane js-hidden" id="bar" role="tabpanel" aria-labelledby="bar-tab">bar</div>
            </div>
        </div>
    */

    var Tabs = function () {

        var view = {

            showTab: function (container, clickedTab, originalEvent) {

                var classes = 'tabs__tab--selected tone-colour tone-accent-border';

                // find the active tab in the set. returns an array of 1 item, hence [0]
                var currentTab = common.$g('.tabs__tab--selected a', container)[0];

                // trim the leading # and find the matching panel element
                var paneToShow = container.querySelector('#' + clickedTab.getAttribute('href').substring(1));
                var paneToHide = container.querySelector('#' + currentTab.getAttribute('href').substring(1));

                // show hide stuff
                bonzo(currentTab.parentNode).removeClass(classes);
                bonzo(clickedTab.parentNode).addClass(classes);
                bonzo(currentTab.parentNode).attr('aria-selected', false);
                bonzo(clickedTab.parentNode).attr('aria-selected', true);
                bonzo(paneToHide).hide();
                bonzo(paneToShow).removeClass('js-hidden').show().focus();

                // only do this if we know the href was a tab ID, not a URL
                originalEvent.preventDefault();
            }
        };

        this.init = function (context) {

            Array.prototype.forEach.call(context.querySelectorAll('.tabs'), function(container) {

                var tabSet = common.$g('.js-tabs', container)[0],
                    tabSetHeight = 0,
                    vPos = 0,
                    vHeight = 0,
                    vScroll = 0;

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

                    tabSet.setAttribute('data-is-bound', true);
                }
            });
        };
    };

    return Tabs;

});
