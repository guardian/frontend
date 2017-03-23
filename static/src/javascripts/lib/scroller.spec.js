// @flow

import bonzo from 'bonzo';
import scroller from 'lib/scroller';

describe('scroller', () => {
    test('scrollTo() - without timeout', () => {
        scroller.scrollTo(100, 0, 'linear');
        expect(bonzo(document.body).scrollTop()).toBe(100);
    });

    test('scrollTo() - with timeout', done => {
        const body = bonzo(document.body);

        scroller.scrollTo(100, 200, 'linear');
        expect(body.scrollTop()).toBe(0);

        setTimeout(
            () => {
                expect(body.scrollTop()).toBe(100);
                done();
            },
            200
        );
    });

    test('scrollToElement()', () => {
        const body = bonzo(document.body);
        const spacer: string = '<div style="height: 100px; width: 100%;"></div>';
        const target: string = '<div id="scroll-target"></div>';

        body.innerHTML = `${spacer} ${target}`;

        scroller.scrollToElement('#scroll-target');
        expect(body.scrollTop()).toBe(100);
    });
});
