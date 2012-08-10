define(['common', 'modules/expandable'], function(common, Expandable) {

    describe("Expandable", function() {

        it("should expand and contract a panel", function(){
            var t = document.getElementById('trail-1');
            var x = new Expandable(t);
            x.load();

            // shut
            common.mediator.emit('modules:expandable:stateChange', false);
            expect(document.getElementById('trail-1').className).toBe('shut');
           
            // open 
            common.mediator.emit('modules:expandable:stateChange', true);
            expect(document.getElementById('trail-1').className).toBe('open');
        
        });
        
        it("should visually represent the number of items in the panel", function(){
            var t = document.getElementById('trail-1');
            var x = new Expandable(t);
            expect(x.model.getCount()).toBe('3');
        });

    
    });

});
