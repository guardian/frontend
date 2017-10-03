// @flow

import mediator from 'lib/mediator';
import { ScrollDepth } from 'common/modules/analytics/scrollDepth';

jest.mock('lodash/functions/debounce', (): void => fn => {
    fn();
});

jest.mock('lib/mediator');

describe('Scroll depth', () => {
    it('should log page depth on scroll.', done => {
        if (document.body) {
            document.body.style.height = '100px';

            // eslint-disable-next-line no-new
            new ScrollDepth({
                isContent: true,
            });

            mediator.on('scrolldepth:data', data => {
                expect(data.page.depth).toEqual(100);

                done();
            });

            window.scrollTo(0, 50);

            jest.useFakeTimers();

            mediator.emit('window:throttledScroll');

            jest.runAllTimers();
        } else {
            done();
        }
    });
});
