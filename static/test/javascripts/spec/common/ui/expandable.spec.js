/*eslint-disable no-new*/
define(['common/utils/$', 'common/modules/ui/expandable', 'helpers/fixtures'],
function ($, Expandable, fixtures) {
    describe('Expandable', function () {

        beforeEach(function () {
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
            });
        });

        afterEach(function () {
            fixtures.clean('expanadble-fixture');
        });

        it('should be able to operate multiple exapandables on a single page', function () {

            new Expandable({ dom: document.querySelector('#trail-a') }).init();
            new Expandable({ dom: document.querySelector('#trail-b') }).init();

            expect($('#trail-a .cta')[0].innerHTML).toContain('5');
            expect($('#trail-b .cta')[0].innerHTML).toContain('3');
        });

        it('should correctly render the default shut state', function () {
            new Expandable({ dom: document.querySelector('#trail-c'), expanded: false }).init();

            expect($('#trail-c')[0].className).toContain('shut');
            expect($('#trail-c .cta').text()).toBe('Show 3 more');
        });

        it('should expand and contract a panel', function () {
            var x = new Expandable({ dom: document.querySelector('#trail-d') });
            x.init();

            // shut
            x.toggle();
            expect(document.getElementById('trail-d').className).toBe('shut');

            // open
            x.toggle();
            expect(document.getElementById('trail-d').className).toBe('');

        });

        it('should visually represent the number of items in the panel', function () {
            new Expandable({ dom: document.querySelector('#trail-e') }).init();
            expect($('#trail-e .cta')[0].innerHTML).toContain('3');
        });

        it('should not enable expandables where there are less than three hidden trails', function () {
            new Expandable({ dom: document.querySelector('#trail-g') }).init();
            expect($('#trail-g .cta').length).toBe(0);
        });

        it('should be able to turn off the trail count', function () {
            new Expandable({ dom: document.querySelector('#trail-h'), showCount: false }).init();
            expect($('#trail-h .cta')[0].innerHTML).not.toContain('3');
        });

    });
});
