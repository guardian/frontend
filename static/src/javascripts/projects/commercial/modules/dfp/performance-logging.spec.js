// @flow
import { defer, wrap } from 'commercial/modules/dfp/performance-logging';

jest.mock('common/modules/analytics/beacon', () => ({
    postJson: jest.fn(),
}));
jest.mock('ophan/ng', () => {});

describe('Performance Logging', () => {
    describe('wrap', () => {
        it('should return the wrapped function return value', () => {
            const randomVal = Math.random();
            const fn = wrap('func', () => randomVal);
            expect(fn()).toEqual(randomVal);
        });

        it('should resolve to the wrapped function return value', done => {
            const randomVal = Math.random();
            const fn = wrap('func', () => Promise.resolve(randomVal));
            fn()
                .then(value => {
                    expect(value).toEqual(randomVal);
                })
                .then(done)
                .catch(done.fail);
        });

        it('should not swallow exception', () => {
            const fn = wrap('func', () => {
                throw new Error('hello');
            });
            try {
                fn();
            } catch (e) {
                expect(e.message).toEqual('hello');
            }
        });

        it('should not swallow promise rejection', done => {
            const fn = wrap('func', () => Promise.reject('hello'));
            fn()
                .catch(value => {
                    expect(value).toEqual('hello');
                })
                .then(done)
                .catch(done.fail);
        });
    });

    describe('defer', () => {
        it('should pass two timing functions', () => {
            const fn = defer('func', (fn1, fn2) => {
                expect(fn1).toEqual(expect.any(Function));
                expect(fn2).toEqual(expect.any(Function));
            });
            fn();
        });

        it('should return the wrapped function return value', () => {
            const randomVal = Math.random();
            const fn = defer('func', () => randomVal);
            expect(fn()).toEqual(randomVal);
        });

        it('should resolve to the wrapped function return value', done => {
            const randomVal = Math.random();
            const fn = defer('func', () => Promise.resolve(randomVal));
            fn()
                .then(value => {
                    expect(value).toEqual(randomVal);
                })
                .then(done)
                .catch(done.fail);
        });

        it('should not swallow exception', () => {
            const fn = defer('func', () => {
                throw new Error('hello');
            });
            try {
                fn();
            } catch (e) {
                expect(e.message).toEqual('hello');
            }
        });

        it('should not swallow promise rejection', done => {
            const fn = defer('func', () => Promise.reject('hello'));
            fn()
                .catch(value => {
                    expect(value).toEqual('hello');
                })
                .then(done)
                .catch(done.fail);
        });
    });
});
