define(['common', 'modules/navigation/controls', 'bean'], function(common, NavigationControls, bean) {

    describe("Navigation", function() {

        // set up nav links
        var sectionHeaderLink = document.getElementById('sections-control-header');
        var sectionFooterLink = document.getElementById('sections-control-footer');
        var topstoriesHeaderLink = document.getElementById('topstories-control-header');
        var topstoriesFooterLink = document.getElementById('topstories-control-footer');
        
        // set up popup panels
        var sectionHeaderPopup = document.getElementById('sections-header');
        var sectionFooterPopup = document.getElementById('sections-footer');
        var topstoriesHeaderPopup = document.getElementById('topstories-header');
        var topstoriesFooterPopup = document.getElementById('topstories-footer');

        // initialise nav + bindings
        var controls = new NavigationControls();
        controls.init();

        it("should show the correct item when a nav link is clicked", function() {
            bean.fire(sectionHeaderLink, 'click');
            expect(sectionHeaderPopup.getAttribute('class')).toBe('on');
        });

        // at this stage, the section header popup will now be visible
        it("should hide any open popups when a nav link is clicked", function() {
            waits(500);
            bean.fire(topstoriesHeaderLink, 'click');
            expect(sectionHeaderPopup.getAttribute('class')).toBe('initially-off')
        });

        // at this stage, the top stories header popup will now be visible
        it("should not effect the header popups when a footer nav link is clicked", function() {
            waits(500);
            bean.fire(topstoriesFooterLink, 'click');
            bean.fire(sectionFooterLink, 'click');
            expect(topstoriesHeaderPopup.getAttribute('class')).toBe('on');
        });

    });

});
