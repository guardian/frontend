import { _ as testExports } from 'commercial/modules/messenger/viewport';
import { getViewport as getViewport_ } from 'lib/detect';

const getViewport = getViewport_;

const addResizeListener = testExports.addResizeListener;
const reset = testExports.reset;

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

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = domSnippet;
        }
        iframe = document.getElementById('iframe1');
        reset(mockWindow);
        expect.hasAssertions();
    });

    afterEach(() => {
        iframe = null;
        reset();
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should send viewport dimensions as soon as the iframe starts listening', () => {
        const size = {
            width: 800,
            height: 600,
        };
        getViewport.mockReturnValue(size);
        return addResizeListener(iframe, respond).then(() => {
            expect(respond).toHaveBeenCalledWith(null, size);
        });
    });

    it('should send viewport dimensions when the window gets resized', () => {
        const size = {
            width: 1024,
            height: 768,
        };
        getViewport.mockReturnValue(size);
        return addResizeListener(iframe, respond)
            .then(() => onResize && onResize())
            .then(() => {
                expect(respond).toHaveBeenCalledWith(null, size);
            });
    });
});
