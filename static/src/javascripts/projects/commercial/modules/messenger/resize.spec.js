// @flow
import type { JestMockT } from 'jest';
import { resize, _ } from './resize.js';

const { normalise } = _;

const foolFlow = (mockFn: any) => ((mockFn: any): JestMockT);

describe('Cross-frame messenger: resize', () => {
    beforeEach(done => {
        if (document.body) {
            document.body.innerHTML = `
              <div id="slot01" class="js-ad-slot"><div id="iframe01" class="iframe" data-unit="ch"></div></div>
              <div id="slot02" class="js-ad-slot"><div id="iframe02" class="iframe" data-unit="px"></div></div>
              <div id="slot03" class="js-ad-slot"><div id="iframe03" class="iframe" data-unit="em"></div></div>
              <div id="slot04" class="js-ad-slot"><div id="iframe04" class="iframe" data-unit="rem"></div></div>
              <div id="slot05" class="js-ad-slot"><div id="iframe05" class="iframe" data-unit="vmin"></div></div>
              <div id="slot06" class="js-ad-slot"><div id="iframe06" class="iframe" data-unit="vmax"></div></div>
              <div id="slot07" class="js-ad-slot"><div id="iframe07" class="iframe" data-unit="vh"></div></div>
              <div id="slot08" class="js-ad-slot"><div id="iframe08" class="iframe" data-unit="vw"></div></div>
              <div id="slot09" class="js-ad-slot"><div id="iframe09" class="iframe" data-unit="ex"></div></div>
              </div>`;
        }
        done();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    describe('normalise function', () => {
        it('should normalise the length passed in', () => {
            expect(normalise('300')).toBe('300px');
            expect(normalise('600px')).toBe('600px');
            expect(normalise('900??')).toBe('900px');
        });

        it('should accept all relative units', () => {
            const units = [
                'ch',
                'px',
                'em',
                'rem',
                'vmin',
                'vmax',
                'vh',
                'vw',
                'ex',
            ];
            units.forEach(unit => {
                expect(normalise(`10${unit}`)).toBe(`10${unit}`);
            });
        });
    });

    describe('resize function', () => {
        it('should resolve if the specs are empty', () => {
            const fakeAdSlot = document.createElement('div');
            const fakeIframe = document.createElement('iframe');
            const result = resize({}, fakeIframe, fakeAdSlot);
            expect(result).toBeNull();
        });

        it('should set width and height of the ad slot', done => {
            const fallback = document.createElement('div');
            const fakeIframe = document.getElementById('iframe01') || fallback;
            const fakeAdSlot = document.getElementById('slot01') || fallback;
            foolFlow(
                resize({ width: '20', height: '10' }, fakeIframe, fakeAdSlot)
            )
                .then(() => {
                    expect(fakeIframe.style.height).toBe('10px');
                    expect(fakeIframe.style.width).toBe('20px');
                    expect(fakeAdSlot.style.height).toBe('10px');
                    expect(fakeAdSlot.style.width).toBe('20px');
                })
                .then(done)
                .catch(done.fail);
        });
    });
});
