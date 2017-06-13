// @flow
import type { JestMockT } from 'jest';
import { register } from 'commercial/modules/messenger';
import { _ } from './resize.js';

const { resize, normalise } = _;

const foolFlow = (mockFn: any) => ((mockFn: any): JestMockT);

jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

jest.setMock('commercial/modules/messenger', register);

describe('Cross-frame messenger: resize', () => {
    beforeEach(done => {
        if (document.body) {
            document.body.innerHTML = `
              <div id="slot00" class="adslot">
                <div id="iframe00" class="iframe">
                </div>
              </div>`;
        }
        done();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('will call register', () => {
        expect(register).toHaveBeenCalled();
        expect(foolFlow(register).mock.calls[0][0]).toBe('resize');
    });

    describe('normalise function', () => {
        it('will normalise the length passed in', () => {
            expect(normalise('')).toBe('');
            expect(normalise(250)).toBe('250px');
            expect(normalise('300foo')).toBe('300px');
            expect(normalise('600em')).toBe('600em');
        });
    });

    describe('resize function', () => {
        it('should return Null if specs are empty', () => {
            const fakeAdSlot = document.createElement('div');
            const fakeIframe = document.createElement('iframe');
            const result = resize({}, fakeIframe, fakeAdSlot);
            expect(result).toBeNull();
        });

        it('should set width and height of the ad slot', done => {
            const fallback = document.createElement('div');
            const fakeIframe = document.getElementById('iframe00') || fallback;
            const fakeAdSlot = document.getElementById('slot00') || fallback;
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
