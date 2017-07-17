// @flow
import { noop } from 'lib/noop';
import {
    register as register_,
    unregister as unregister_,
    _ as testExports,
} from 'commercial/modules/messenger';
import dfpOrigin from 'commercial/modules/messenger/dfp-origin';
import { postMessage } from 'commercial/modules/messenger/post-message';

const onMessage: any = testExports.onMessage;
const register: any = register_;
const unregister: any = unregister_;

const addEventListenerSpy = jest
    .spyOn(global, 'addEventListener')
    .mockImplementation(() => {});
const removeEventListenerSpy = jest
    .spyOn(global, 'removeEventListener')
    .mockImplementation(() => {});
const jsonParseSpy = jest.spyOn(JSON, 'parse');

jest.mock('commercial/modules/messenger/post-message', () => ({
    postMessage: jest.fn(),
}));

jest.mock('lib/report-error', () => jest.fn());

describe('Cross-frame messenger', () => {
    const routines = {
        thrower() {
            throw new Error('catch this if you can!');
        },
        respond(value) {
            return `${value} johnny!`;
        },
        add1(value) {
            return value + 1;
        },
        add2(_, ret) {
            return ret + 2;
        },
        rubicon() {
            return 'rubicon';
        },
    };

    beforeEach(() => {
        jest.resetAllMocks();
        expect.hasAssertions();
    });

    it('should expose register and unregister as a public API', () => {
        expect(register).toBeDefined();
        expect(unregister).toBeDefined();
    });

    it('should register an event listener when there is at least one message routine', () => {
        register('test', noop);
        expect(addEventListenerSpy).toHaveBeenCalled();
        unregister('test', noop);
        expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should only respond when origin is whitelisted', done => {
        const payload = {
            type: 'abc',
            value: '',
            id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        };
        jsonParseSpy.mockImplementationOnce(() => payload);

        register('abc', noop);

        Promise.resolve()
            .then(() => onMessage({ origin: 'http://google.com', source: '' }))
            .then(() => {
                expect(postMessage).not.toHaveBeenCalled();
                return onMessage({ origin: dfpOrigin, source: '' });
            })
            .then(() => {
                expect(postMessage).toHaveBeenCalled();
            })
            .then(done)
            .catch(done.fail)
            .then(() => {
                unregister('abc', noop);
            });
    });

    it('should not respond when sending malformed JSON', done => {
        jsonParseSpy.mockImplementation(() => {
            throw new Error();
        });

        Promise.resolve()
            .then(() => onMessage({ origin: dfpOrigin, data: '{', source: '' }))
            .then(() => {
                expect(postMessage).not.toHaveBeenCalled();
            })
            .then(done)
            .catch(done.fail);
    });

    it('should not respond when sending incomplete payload', done => {
        const payloads = [
            { type: 'missing data' },
            { value: 'missing type' },
            { type: 'unregistered', value: 'type' },
        ];

        Promise.all(
            payloads.map(data => {
                jsonParseSpy.mockReturnValueOnce(data);
                return onMessage({ origin: dfpOrigin, data: '', source: '' });
            })
        ).then(() => {
            expect(postMessage).not.toHaveBeenCalled();
            done();
        });
    });

    it('should respond with a 405 code when no listener is attached to a message type', done => {
        const payload = {
            id: '01234567-89ab-cdef-fedc-ba9876543210',
            type: 'that',
            value: 'hello',
        };
        jsonParseSpy.mockImplementationOnce(() => payload);
        register('this', noop);
        register('that', noop);
        unregister('that', noop);
        Promise.resolve()
            .then(() =>
                onMessage({
                    origin: dfpOrigin,
                    data: JSON.stringify(payload),
                    source: 'source',
                })
            )
            .then(() => {
                expect(postMessage).toHaveBeenCalledWith(
                    {
                        error: {
                            code: 405,
                            message: 'Service that not implemented',
                        },
                        id: payload.id,
                        result: null,
                    },
                    'source',
                    dfpOrigin
                );
            })
            .then(done)
            .catch(done.fail)
            .then(() => {
                unregister('this', noop);
            });
    });

    it('should throw when the listener fails', done => {
        const payload = {
            id: '01234567-89ab-cdef-fedc-ba9876543210',
            type: 'this',
            value: 'hello',
        };
        jsonParseSpy.mockImplementationOnce(() => payload);
        register('this', routines.thrower);
        Promise.resolve()
            .then(() =>
                onMessage({ origin: dfpOrigin, data: '', source: 'source' })
            )
            .then(() => {
                expect(postMessage).toHaveBeenCalledWith(
                    {
                        error: {
                            code: 500,
                            message:
                                'Internal server error\n\nError: catch this if you can!',
                        },
                        id: payload.id,
                        result: null,
                    },
                    'source',
                    dfpOrigin
                );
            })
            .then(done)
            .catch(done.fail)
            .then(() => {
                unregister('this', routines.thrower);
            });
    });

    it("should respond with the routine's return value", done => {
        const payload = {
            id: '01234567-89ab-cdef-fedc-ba9876543210',
            type: 'this',
            value: 'hello',
        };
        jsonParseSpy.mockImplementationOnce(() => payload);
        register('this', routines.respond);
        Promise.resolve()
            .then(() =>
                onMessage({
                    origin: dfpOrigin,
                    data: '',
                    source: 'sauce',
                })
            )
            .then(() => {
                expect(postMessage).toHaveBeenCalledWith(
                    {
                        error: null,
                        id: payload.id,
                        result: 'hello johnny!',
                    },
                    'sauce',
                    dfpOrigin
                );
            })
            .then(done)
            .catch(done.fail)
            .then(() => {
                unregister('this', routines.respond);
            });
    });

    it('should respond with the listeners cumulative result', done => {
        const payload = {
            id: '01234567-89ab-cdef-fedc-ba9876543210',
            type: 'this',
            value: 1,
        };
        jsonParseSpy.mockImplementationOnce(() => payload);
        register('this', routines.add1);
        register('this', routines.add2);

        Promise.resolve()
            .then(() =>
                onMessage({ origin: dfpOrigin, data: '', source: 'sorcery' })
            )
            .then(() => {
                expect(postMessage).toHaveBeenCalledWith(
                    {
                        error: null,
                        id: payload.id,
                        result: 4,
                    },
                    'sorcery',
                    dfpOrigin
                );
            })
            .then(done)
            .catch(done.fail)
            .then(() => {
                unregister('this', routines.add1);
                unregister('this', routines.add2);
            });
    });

    it('should respond to Rubicon messages with no IDs', done => {
        const payload = {
            type: 'set-ad-height',
            value: { id: 'test', height: '20px' },
        };
        jsonParseSpy.mockImplementationOnce(() => payload);
        register('resize', routines.rubicon);
        onMessage({ origin: dfpOrigin, data: '', source: 'saucy' })
            .then(() => {
                expect(postMessage).toHaveBeenCalledWith(
                    {
                        error: null,
                        id: 'aaaa0000-bb11-cc22-dd33-eeeeee444444',
                        result: 'rubicon',
                    },
                    'saucy',
                    dfpOrigin
                );
            })
            .then(done)
            .catch(done.fail)
            .then(() => {
                unregister('resize', routines.rubicon);
            });
    });
});
