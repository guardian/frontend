define(['common', 'modules/expandable'], function(common, Expandable) {

    describe("Expandable", function() {

        it("should expand and contract a panel", function(){
            var t = document.getElementById('trail-d');
            var x = new Expandable(t).load();

            // shut
            common.mediator.emit('modules:expandable:stateChange:trail-d', false);
            expect(document.getElementById('trail-d').className).toBe('shut');
           
            // open 
            common.mediator.emit('modules:expandable:stateChange:trail-d', true);
            expect(document.getElementById('trail-d').className).toBe('open');
        
        });
        
        it("should visually represent the number of items in the panel", function(){
            var t = document.getElementById('trail-d');
            var x = new Expandable(t);
            expect(common.$('#trail-d .count')[0].innerHTML).toBe('3');
        });
        
        it("should be able to operate multiple exapandables on a single page", function(){
            
            var ta = document.getElementById('trail-a');
            var tb = document.getElementById('trail-b');
            var a = new Expandable(ta); a.load();
            var b = new Expandable(tb); b.load();
            
            expect(common.$('#trail-a .count')[0].innerHTML).toBe('5');
            expect(common.$('#trail-b .count')[0].innerHTML).toBe('2');

            common.mediator.emit('modules:expandable:stateChange:trail-a', false);
            common.mediator.emit('modules:expandable:stateChange:trail-b', true);
        
            expect(document.getElementById('trail-a').className).toBe('shut');
            expect(document.getElementById('trail-b').className).toBe('open');
        });

        it("should correctly render the default shut state", function(){
            var tc = document.getElementById('trail-c');
            var a = new Expandable(tc);
            a.load();
            expect(tc.className).toBe('shut');
            expect(common.$('#trail-c .cta')[0].innerHTML).toBe('more');
        });

    });

});
