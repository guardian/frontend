define(['common', 'modules/ui/expandable', 'bonzo', 'helpers/fixtures'], function(common, Expandable, bonzo, fixtures) {

    describe("Expandable", function() {

        beforeEach(function() {
            fixtures.render({
                id: 'expanadble-fixture',
                fixtures: [
                    ' <div id="trail-a" data-count="5">' +
                        '<ul>' +
                            '<li class="t1">one</li>' +
                            '<li class="t2">two</li>' +
                        '</ul>' +
                        '<ul class="flex">' +
                            '<li class="t3">three</li>' +
                            '<li class="t4">four</li>' +
                            '<li class="t5">five</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div id="trail-b" data-count="3">' +
                        '<ul>' +
                            '<li class="t1">one</li>' +
                            '<li class="t1">two</li>' +
                        '</ul>' +
                        '<ul class="flex">' +
                            '<li class="t2">three</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div id="trail-c" data-count="3" class="shut">' +
                        '<ul></ul>' +
                    '</div>' +
                    '<div id="trail-d" data-count="1" class="shut">' +
                        '<ul></ul>' +
                    '</div>' +
                    '<div id="trail-e" data-count="3">' +
                        '<ul>' +
                            '<li class="t1">one</li>' +
                            '<li class="t2">two</li>' +
                        '</ul>' +
                        '<ul class="flex">' +
                            '<li class="t3">three</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div id="trail-f" data-count="-1">' +
                        '<ul></ul>' +
                    '</div>' +
                    '<div id="trail-g" data-count="2">' +
                        '<ul></ul>' +
                    '</div>' +
                    '<div id="trail-h" data-count="3">' +
                        '<ul>' +
                            '<li class="t1">one</li>' +
                            '<li class="t2">two</li>' +
                        '</ul>' +
                        '<ul class="flex">' +
                            '<li class="t3">three</li>' +
                        '</ul>' +
                    '</div>'
                ]
            })
        });

        afterEach(function() {
            fixtures.clean('expanadble-fixture');
        });

        it("should be able to operate multiple exapandables on a single page", function(){

            var a = new Expandable({ dom: document.querySelector('#trail-a') }).init();
            var b = new Expandable({ dom: document.querySelector('#trail-b') }).init();

            expect(common.$g('#trail-a .cta')[0].innerHTML).toContain('5');
            expect(common.$g('#trail-b .cta')[0].innerHTML).toContain('3');
        });

        it("should correctly render the default shut state", function(){
            var a = new Expandable({ dom: document.querySelector('#trail-c'), expanded: false }).init();

            expect(common.$g('#trail-c')[0].className).toContain('shut');
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

        it("should be able to turn off the trail count", function(){
            var x = new Expandable({ dom: document.querySelector('#trail-h'), showCount: false }).init();
            expect(common.$g('#trail-h .cta')[0].innerHTML).not.toContain('3');
        });

    });

});
