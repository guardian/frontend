define(['common', 'modules/expandable', 'bonzo'], function(common, Expandable, bonzo) {

    describe("Expandable", function() {

        it("should be able to operate multiple exapandables on a single page", function(){
            
            var a = new Expandable({ dom: document.querySelector('#trail-a') }).init();
            var b = new Expandable({ dom: document.querySelector('#trail-b') }).init();
             
            expect(common.$g('#trail-a .cta')[0].innerHTML).toContain('5');
            expect(common.$g('#trail-b .cta')[0].innerHTML).toContain('3');
        });

        it("should correctly render the default shut state", function(){
            var a = new Expandable({ dom: document.querySelector('#trail-c'), expanded: false }).init();
            
            expect(common.$g('#trail-c')[0].className).toBe('shut');
            expect(common.$g('#trail-c .cta').text()).toBe('Show 3 more');
        });

        it("should expand and contract a panel", function(){
            var x = new Expandable({ dom: document.querySelector('#trail-d') });
            x.init();
    
            // shut
            x.toggle();
            expect(document.getElementById('trail-d').className).toBe('shut');
           
            // open 
            x.toggle();
            expect(document.getElementById('trail-d').className).toBe('');
        
        });
        
        it("should visually represent the number of items in the panel", function(){
            var x = new Expandable({ dom: document.querySelector('#trail-e') }).init();
            expect(common.$g('#trail-e .cta')[0].innerHTML).toContain('3');
        });
        
        it("should not enable expandables where there are less than three hidden trails", function(){
            var x = new Expandable({ dom: document.querySelector('#trail-g') }).init();
            expect(common.$g('#trail-g .cta').length).toBe(0);
        });
       
    });

});
