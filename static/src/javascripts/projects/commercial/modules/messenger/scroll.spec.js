// @flow
import { _ as testExports } from 'commercial/modules/messenger/scroll';
import detect from 'lib/detect';

const addScrollListener: any = testExports.addScrollListener;
const removeScrollListener: any = testExports.removeScrollListener;
const reset = testExports.reset;

jest.mock('commercial/modules/messenger', () => ({
    register: jest.fn(),
}));

jest.mock('lib/detect', () => ({
    getViewport: jest.fn(),
}));

describe('Cross-frame messenger: scroll', () => {
    let iframe1 = {};
    let iframe2 = {};
    let onScroll = () => Promise.resolve();

    const respond1 = jest.fn();
    const respond2 = jest.fn();

    const domSnippet = `
         <div id="ad-slot-1" class="js-ad-slot"><div id="iframe1" style="height: 200px"></div></div>
         <div id="ad-slot-2" class="js-ad-slot"><div id="iframe2" style="height: 200px"></div></div>
     `;

    const mockIframePosition = (iframe: any, top: number) => {
        jest.spyOn(iframe, 'getBoundingClientRect').mockImplementation(() => ({
            left: 8,
            right: 392,
            height: 200,
            width: 384,
            top,
            bottom: top + 200,
        }));
    };

    beforeEach(done => {
        jest
            .spyOn(global, 'addEventListener')
            .mockImplementation((_, callback) => {
                onScroll = callback;
            });
        jest.spyOn(global, 'removeEventListener').mockImplementation(() => {
            onScroll = () => Promise.resolve();
        });
        if (document.body) {
            document.body.innerHTML = domSnippet;
        }
        iframe1 = document.getElementById('iframe1');
        iframe2 = document.getElementById('iframe2');

        detect.getViewport.mockReturnValue({ width: 400, height: 300 });

        done();
    });

    afterEach(() => {
        removeScrollListener(iframe1);
        removeScrollListener(iframe2);
        iframe1 = {};
        iframe2 = {};
        jest.resetModules();
        jest.resetAllMocks();
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    describe('With IntersectionObserver', () => {
        let onIntersect = null;
        class IntersectionObserver {
            constructor(callback) {
                onIntersect = callback;
                return Object.freeze({
                    observe: () => {},
                    unobserve: () => {},
                    disconnect: () => {
                        onIntersect = null;
                    },
                });
            }
        }

        beforeEach(() => {
            Object.defineProperty(global, 'IntersectionObserver', {
                value: IntersectionObserver,
                writable: true,
            });
            reset(true);
            addScrollListener(iframe1, respond1);
            addScrollListener(iframe2, respond2);
        });

        afterEach(() => {
            Object.defineProperty(global, 'IntersectionObserver', {
                value: null,
                writable: true,
            });
        });

        it('should call respond1 but not respond2 at the top of the page', done => {
            console.log(onIntersect);
            if (onIntersect) {
                onIntersect([
                    { target: iframe1, intersectionRatio: 0.5 },
                    { target: iframe2, intersectionRatio: 0 },
                ]);
            }
            onScroll()
                .then(() => {
                    expect(respond1).toHaveBeenCalledTimes(2);
                    expect(respond2).toHaveBeenCalledTimes(1);
                })
                .then(done)
                .catch(done.fail);
        });

        it('should call respond2 but not respond1 at the bottom of the page', done => {
            if (onIntersect) {
                onIntersect([
                    { target: iframe1, intersectionRatio: 0 },
                    { target: iframe2, intersectionRatio: 0.5 },
                ]);
            }
            onScroll()
                .then(() => {
                    expect(respond1).toHaveBeenCalledTimes(1);
                    expect(respond2).toHaveBeenCalledTimes(2);
                })
                .then(done)
                .catch(done.fail);
        });
    });

    describe('Without IntersectionObserver', () => {
        beforeEach(() => {
            reset(false);
            addScrollListener(iframe1, respond1);
            addScrollListener(iframe2, respond2);
        });

        it('should call respond1 but not respond2 at the top of the page', done => {
            mockIframePosition(iframe1, 8);
            mockIframePosition(iframe2, 6320);
            onScroll()
                .then(() => {
                    expect(respond1).toHaveBeenCalledTimes(2);
                    expect(respond2).toHaveBeenCalledTimes(1);
                })
                .then(done)
                .catch(done.fail);
        });

        it('should call respond2 but not respond1 at the bottom of the page', done => {
            mockIframePosition(iframe1, -6304);
            mockIframePosition(iframe2, 8);
            onScroll()
                .then(() => {
                    expect(respond1).toHaveBeenCalledTimes(1);
                    expect(respond2).toHaveBeenCalledTimes(2);
                })
                .then(done)
                .catch(done.fail);
        });
    });
});
