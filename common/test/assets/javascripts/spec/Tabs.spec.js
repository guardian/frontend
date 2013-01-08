define(['common', 'modules/tabs', 'bean'], function(common, Tabs, bean) {

    describe("Tabs", function() {

        var t = new Tabs();
        t.init();

        var tab1 = document.getElementById('tab1'); // is selected by default
        var tab2 = document.getElementById('tab2');
        var tab1panel = document.getElementById('tab1panel');
        var tab2panel = document.getElementById('tab2panel');

        var independentTabPanel = document.getElementById('tab2panel_2');
        var allTabs = document.querySelectorAll('ol.tabs a');
        var fakeTab = document.getElementById('fake-tab');

        // only way i can think of to test if a valid URL would actually execute
        for (var i in allTabs) {
            tab = allTabs[i];
            bean.add(tab, 'click', function(e){
                var link = this.getAttribute('href');
                if (link.substring(0,1) !== '#') {
                    e.stop(); // have to override us from leaving page
                    this.setAttribute('data-valid-link', '1');
                }
            });
        }

        it("should add a CSS class to the selected tab when clicked", function(){
            var li = tab2.parentNode;
            bean.fire(tab2, 'click');
            expect(li.getAttribute('class')).toBe('tabs-selected');
        });

        it("should remove a CSS class from the previously-selected tab when clicked", function(){
            var li = tab2.parentNode;
            bean.fire(tab1, 'click');
            expect(li.getAttribute('class')).toBe('');
        });

        it("should show the correct panel when a tab is clicked", function(){
            bean.fire(tab2, 'click');
            expect(tab2panel.getAttribute('style')).toBe('');
            expect(tab2panel.getAttribute('class')).not.toContain('js-hidden');
        });

        it("should hide other panels when a tab is clicked", function(){
            bean.fire(tab1, 'click');
            expect(tab2panel.getAttribute('style')).toContain('display: none');
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
