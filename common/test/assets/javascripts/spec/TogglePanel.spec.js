define(['modules/ui/togglepanel', 'common', 'bonzo', 'bean'], function(togglePanel, common, bonzo, bean) {

    describe('Toggle Panel', function() {
        
        var $collapsible,
            collapsibleHtml = '<div><button data-toggle-panel="toggle-panel" class="js-collapsible"><i class="i-filter-arrow-down"></i></button><div id="toggle-panel" class="js-hidden"></div></div>';

        beforeEach(function() {
            // create container
            $collapsible = bonzo(bonzo.create(collapsibleHtml))
                .appendTo('body');
            togglePanel.init($collapsible[0]);
        });

        afterEach(function() {
            $collapsible.remove();
        });

        it('should collapse', function() {
            var collapsible = $collapsible[0];
            // click collapsible
            bean.fire(collapsible.querySelector('button'), 'click');
            expect(common.$g('i', collapsible).hasClass('i-filter-arrow-down')).toBeFalsy();
            expect(common.$g('i', collapsible).hasClass('i-filter-arrow-up')).toBeTruthy();
            expect(common.$g('#toggle-panel', collapsible).hasClass('js-hidden')).toBeFalsy();
        })

        it('should open', function() {
            var collapsible = $collapsible[0];
            // click collapsible twice
            bean.fire(collapsible.querySelector('button'), 'click');
            bean.fire(collapsible.querySelector('button'), 'click');
            expect(common.$g('i', collapsible).hasClass('i-filter-arrow-down')).toBeTruthy();
            expect(common.$g('i', collapsible).hasClass('i-filter-arrow-up')).toBeFalsy();
            expect(common.$g('#toggle-panel', collapsible).hasClass('js-hidden')).toBeTruthy();
        })

    });

});
