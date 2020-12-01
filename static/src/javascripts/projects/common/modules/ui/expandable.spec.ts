import { Expandable } from 'common/modules/ui/expandable';
import $ from 'lib/$';

describe('Expandable', () => {
    const ctaOpen = ([amount]: string[]): string =>
        `Show ${amount ? `${amount} ` : ''}fewer`;
    const ctaShut = ([amount]: string[]): string =>
        `Show ${amount ? `${amount} ` : ''}more`;

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
            <div id="trail-a" data-count="5">
                <ul>
                    <li class="t1">one</li>
                    <li class="t2">two</li>
                </ul>

                <ul class="flex">
                    <li class="t3">three</li>
                    <li class="t4">four</li>
                    <li class="t5">five</li>
                </ul>
            </div>

            <div id="trail-b" data-count="3">
                <ul>
                    <li class="t1">one</li>
                    <li class="t1">two</li>
                </ul>

                <ul class="flex">
                    <li class="t2">three</li>
                </ul>

            </div>

            <div id="trail-c" data-count="3" class="shut">
                <ul></ul>
            </div>

            <div id="trail-d" data-count="1" class="shut">
                <ul></ul>
            </div>

            <div id="trail-e" data-count="3">
                <ul>
                    <li class="t1">one</li>
                    <li class="t2">two</li>
                </ul>

                <ul class="flex">
                    <li class="t3">three</li>
                </ul>
            </div>

            <div id="trail-f" data-count="-1">
                <ul></ul>
            </div>

            <div id="trail-g" data-count="2">
                <ul></ul>
            </div>

            <div id="trail-h" data-count="3">
                <ul>
                    <li class="t1">one</li>
                    <li class="t2">two</li>
                </ul>

                <ul class="flex">
                    <li class="t3">three</li>
                </ul>
            </div>
            `;
        }
    });

    it('should be able to operate multiple exapandables on a single page', () => {
        const elA = document.querySelector('#trail-a');
        const elB = document.querySelector('#trail-b');

        if (elA && elB) {
            new Expandable({ dom: elA }).init();
            new Expandable({ dom: elB }).init();

            expect($('#trail-a .cta')[0].innerHTML).toEqual(ctaOpen`5`);
            expect($('#trail-b .cta')[0].innerHTML).toEqual(ctaOpen`3`);
        }
    });

    it('should correctly render the default shut state', () => {
        const elC = document.querySelector('#trail-c');

        if (elC) {
            new Expandable({
                dom: elC,
                expanded: false,
            }).init();

            expect($('#trail-c')[0].classList).toContain('shut');
            expect($('#trail-c .cta').text()).toEqual(ctaShut`3`);
        }
    });

    it('should expand and contract a panel', () => {
        const elD = document.querySelector('#trail-d');

        if (elD) {
            const x = new Expandable({ dom: elD });
            x.init();

            // shut
            x.toggle();
            expect(elD.className).toEqual('shut');

            // open
            x.toggle();
            expect(elD.className).toEqual('');
        }
    });

    it('should visually represent the number of items in the panel', () => {
        const elE = document.querySelector('#trail-e');

        if (elE) {
            new Expandable({ dom: elE }).init();
            expect($('#trail-e .cta')[0].innerHTML).toEqual(ctaOpen`3`);
        }
    });

    it('should not enable expandables where there are less than three hidden trails', () => {
        const elG = document.querySelector('#trail-g');

        if (elG) {
            new Expandable({ dom: elG }).init();
            expect($('#trail-g .cta').length).toEqual(0);
        }
    });

    it('should be able to turn off the trail count', () => {
        const elH = document.querySelector('#trail-h');

        if (elH) {
            new Expandable({
                dom: elH,
                showCount: false,
            }).init();
            expect($('#trail-h .cta')[0].innerHTML).toEqual(ctaOpen``);
        }
    });
});
