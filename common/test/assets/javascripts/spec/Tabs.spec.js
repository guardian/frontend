define(['common', 'modules/tabs', 'bean', 'helpers/fixtures'], function(common, Tabs, bean, fixtures) {

    var t,
        tab1,
        tab2,
        tab1panel,
        tab2panel,
        independentTabPanel,
        allTabs,
        fakeTab;

    describe("Tabs", function() {

        beforeEach(function() {
            fixtures.render({
                id: 'tabs-fixtures',
                fixtures: [
                    '<p id="tabs-test">' +
                        '<div class="tabs">' +
                            '<ol class="tabs__container js-tabs">' +
                                '<li class="tabs__tab tabs__tab--selected"><a id="tab1" href="#tab1panel">Foo</a></li>' +
                                '<li class="tabs__tab"><a id="tab2" href="#tab2panel">Bar</a></li>' +
                            '</ol>' +
                            '<div class="tabs__content">' +
                                '<div class="tabs__pane" id="tab1panel">foo</div>' +
                                '<div class="tabs__pane js-hidden" id="tab2panel">bar</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="tabs-container">' +
                            '<ol class="tabs">' +
                                '<li class="tabs-selected"><a id="tab1_2" href="#tab1panel_2">Foo</a></li>' +
                                '<li><a id="tab2_2" href="#tab2panel_2">Bar</a></li>' +
                                '<li><a id="fake-tab" href="http://www.google.com">Google (fake tab)</a></li>' +
                            '</ol>' +
                            '<div class="tabs-content">' +
                                '<div class="tabs-pane" id="tab1panel_2">foo</div>' +
                                '<div class="tabs-pane js-hidden" id="tab2panel_2">bar</div>' +
                            '</div>' +
                        '</div>' +
                    '</p>'
                ]
            });

            t = new Tabs();
            t.init(document);

            tab1 = document.getElementById('tab1'); // is selected by default
            tab2 = document.getElementById('tab2');
            tab1panel = document.getElementById('tab1panel');
            tab2panel = document.getElementById('tab2panel');

            independentTabPanel = document.getElementById('tab2panel_2');
            allTabs = document.querySelectorAll('ol.js-tabs a');
            fakeTab = document.getElementById('fake-tab');

            // only way i can think of to test if a valid URL would actually execute
            bean.add(fakeTab, 'click', function(e){
                var link = this.getAttribute('href');
                if (link.substring(0,1) !== '#') {
                    e.stop(); // have to override us from leaving page
                    this.setAttribute('data-valid-link', '1');
                }
            });
        });

        afterEach(function() {
            fixtures.clean('tabs-fixtures');
        });

        it("should add a CSS class to the selected tab when clicked", function(){
            var li = tab2.parentNode;
            bean.fire(tab2, 'click');
            expect(li.getAttribute('class')).toContain('tabs__tab tabs__tab--selected');
        });

        it("should remove a CSS class from the previously-selected tab when clicked", function(){
            var li = tab1.parentNode;
            bean.fire(tab2, 'click');
            expect(li.getAttribute('class')).toBe('tabs__tab');
        });

        it("should show the correct panel when a tab is clicked", function(){
            bean.fire(tab2, 'click');
            expect(tab2panel.getAttribute('class')).not.toContain('js-hidden');
        });

        it("should hide other panels when a tab is clicked", function(){
            bean.fire(tab2, 'click');
            expect(tab1panel.getAttribute('style')).toContain('display: none');
        });

        it("should operate independently of other tabsets on the page", function(){
            bean.fire(tab2, 'click');
            expect(independentTabPanel.getAttribute('class')).toContain('js-hidden');
        });

        it("should allow 'fake' tabs with URL hrefs instead of ID selectors", function(){
            bean.fire(fakeTab, 'click');
            expect(fakeTab.getAttribute('data-valid-link')).toBe('1');
        });

    });
});
