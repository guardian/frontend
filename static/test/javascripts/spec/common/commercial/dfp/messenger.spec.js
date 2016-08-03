define([
    'helpers/injector'
], function (
    Injector
) {
    describe('Cross-frame messenger', function () {
        var messenger, mockWindow, mockFrame, onMessage, response;

        var routines = {
            noop: function() {},
            thrower: function() {
                throw 'catch this if you can!';
            },
            respond: function(value) {
                return value + ' johnny!';
            },
            add1: function(value) { return value + 1; },
            add2: function(_, ret) { return ret + 2; }
        };

        var injector = new Injector();
        injector.mock('common/utils/report-error', routines.noop);

        beforeEach(function (done) {
            injector.require(['common/modules/commercial/dfp/messenger'], function($1) {
                messenger = $1;
                mockWindow = jasmine.createSpyObj('window', ['addEventListener', 'removeEventListener', 'postMessage']);
                mockWindow.addEventListener.and.callFake(function(_, _onMessage) {
                    onMessage = _onMessage;
                });
                mockFrame = jasmine.createSpyObj('event.source', ['postMessage']);
                mockFrame.postMessage.and.callFake(function(json) {
                    response = JSON.parse(json);
                });
                done();
            });
        });

        afterEach(function () {
        });

        it('should expose register and unregister as a public API', function () {
            expect(messenger.register).toBeDefined();
            expect(messenger.unregister).toBeDefined();
        });

        it('should register an event listener when there is at least one message routine', function () {
            messenger.register('test', routines.noop, mockWindow);
            expect(mockWindow.addEventListener).toHaveBeenCalled();
            messenger.unregister('test', routines.noop, mockWindow);
            expect(mockWindow.removeEventListener).toHaveBeenCalled();
        });

        it('should not respond when origin is not whitelisted', function () {
            onMessage({ origin: 'http://google.com', source: mockFrame });
            expect(mockFrame.postMessage).not.toHaveBeenCalled();
        });

        it('should not respond when sending malformed JSON', function () {
            onMessage({ origin: 'http://localhost:9876', data: '{', source: mockFrame });
            expect(mockFrame.postMessage).not.toHaveBeenCalled();
        });

        it('should not respond when sending incomplete payload', function () {
            var payloads = [
                { type: 'missing data' },
                { value: 'missing type' },
                { type: 'unregistered', value: 'type' }
            ];
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payloads[0]), source: mockFrame });
            expect(mockFrame.postMessage).not.toHaveBeenCalled();
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payloads[1]), source: mockFrame });
            expect(mockFrame.postMessage).not.toHaveBeenCalled();
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payloads[2]), source: mockFrame });
            expect(mockFrame.postMessage).not.toHaveBeenCalled();
        });

        it('should respond with a 405 code when no listener is attached to a message type', function () {
            var payload = { type: 'that', value: 'hello' };
            messenger.register('this', routines.noop, mockWindow);
            messenger.register('that', routines.noop, mockWindow);
            messenger.unregister('that', routines.noop, mockWindow);
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payload), source: mockFrame });
            expect(mockFrame.postMessage).toHaveBeenCalled();
            expect(response.error.code).toBe(405);
            expect(response.error.message).toBe('Service that not implemented');
            messenger.unregister('this', routines.noop, mockWindow);
        });

        it('should throw when the listener fails', function (done) {
            var payload = { type: 'this', value: 'hello' };
            messenger.register('this', routines.thrower, mockWindow);
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payload), source: mockFrame })
            .then(function () {
                expect(mockFrame.postMessage).toHaveBeenCalled();
                expect(response.error.code).toBe(500);
                expect(response.error.message).toBe('Internal server error\n\ncatch this if you can!');
                messenger.unregister('this', routines.thrower, mockWindow);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should respond with the routine\'s return value', function (done) {
            var payload = { type: 'this', value: 'hello' };
            messenger.register('this', routines.respond, mockWindow);
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payload), source: mockFrame })
            .then(function () {
                expect(mockFrame.postMessage).toHaveBeenCalled();
                expect(response.result).toBe('hello johnny!');
                messenger.unregister('this', routines.respond, mockWindow);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should resond with the listeners cumulative result', function (done) {
            var payload = { type: 'this', value: 1 };
            messenger.register('this', routines.add1, mockWindow);
            messenger.register('this', routines.add2, mockWindow);
            onMessage({ origin: 'http://localhost:9876', data: JSON.stringify(payload), source: mockFrame })
            .then(function () {
                expect(mockFrame.postMessage).toHaveBeenCalled();
                expect(response.result).toBe(4);
                messenger.unregister('this', routines.add1, mockWindow);
                messenger.unregister('this', routines.add2, mockWindow);
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
