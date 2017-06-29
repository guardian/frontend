// @flow

import { _ as testExports } from 'commercial/modules/messenger/viewport';
import detect from 'lib/detect';

const addResizeListener: any = testExports.addResizeListener;
const reset: any = testExports.reset;

jest.mock('lib/detect', () => ({
    getViewport: jest.fn(),
}));

jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

const domSnippet = `
    <div id="ad-slot-1" class="js-ad-slot"><div id="iframe1" style="height: 200px"></div></div>
`;

describe('Cross-frame messenger: viewport', () => {
    const respond = jest.fn();
    let iframe;
    let onResize;

    const mockWindow = {
        addEventListener(_, callback) {
            onResize = callback;
        },
        removeEventListener() {
            onResize = null;
        },
    };

    beforeEach(done => {
        if (document.body) {
            document.body.innerHTML = domSnippet;
        }
        iframe = document.getElementById('iframe1');
        reset(mockWindow);
        done();
    });

    afterEach(() => {
        iframe = null;
        reset();
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should send viewport dimensions as soon as the iframe starts listening', done => {
        const size = {
            width: 800,
            height: 600,
        };
        detect.getViewport.mockReturnValue(size);
        addResizeListener(iframe, respond)
            .then(() => {
                expect(respond).toHaveBeenCalledWith(null, size);
            })
            .then(done)
            .catch(done.fail);
    });

    it('should send viewport dimensions when the window gets resized', done => {
        const size = {
            width: 1024,
            height: 768,
        };
        detect.getViewport.mockReturnValue(size);
        addResizeListener(iframe, respond)
            .then(() => onResize && onResize())
            .then(() => {
                expect(respond).toHaveBeenCalledWith(null, size);
            })
            .then(done)
            .catch(done.fail);
    });
});
