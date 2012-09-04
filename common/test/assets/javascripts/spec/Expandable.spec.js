define(['common', 'modules/expandable'], function(common, Expandable) {

    describe("Expandable", function() {

        it("should be able to operate multiple exapandables on a single page", function(){
            
            var a = new Expandable({ id: 'trail-a' }).initalise();
            var b = new Expandable({ id: 'trail-b' }).initalise();
             
            expect(common.$g('#trail-a .count')[0].innerHTML).toBe('5');
            expect(common.$g('#trail-b .count')[0].innerHTML).toBe('3');

            common.mediator.emit('modules:expandable:expandedChange:trail-a', false);
            common.mediator.emit('modules:expandable:expandedChange:trail-b', true);
        
            expect(document.getElementById('trail-a').className).toBe('shut');
            expect(document.getElementById('trail-b').className).toBe('');
        });

        it("should correctly render the default shut state", function(){
            var a = new Expandable({ id: 'trail-c', expanded: false }).initalise();
            
            expect(common.$g('#trail-c')[0].className).toBe('shut');
            expect(common.$g('#trail-c .cta')[0].innerText).toBe('Show 3 more');
        });

        it("should expand and contract a panel", function(){
            var x = new Expandable({ id: 'trail-d' }).initalise()
    
            // shut
            common.mediator.emit('modules:expandable:expandedChange:trail-d', false);
            expect(document.getElementById('trail-d').className).toBe('shut');
           
            // open 
            common.mediator.emit('modules:expandable:expandedChange:trail-d', true);
            expect(document.getElementById('trail-d').className).toBe('');
        
        });
        
        it("should visually represent the number of items in the panel", function(){
            var x = new Expandable({ id: 'trail-e' }).initalise();
            expect(common.$g('#trail-e .count')[0].innerHTML).toBe('3');
        });
        
        it("should not enable expandables where there are less than three hidden trails", function(){
            var x = new Expandable({ id: 'trail-g' }).initalise();
            expect(common.$g('#trail-g .cta').length).toBe(0);
        });
       
    });

});
