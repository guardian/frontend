import Router from 'modules/router';
import {CONST} from 'modules/vars';
import fakePushState from 'test/utils/push-state';

describe('Router', function () {
    describe('parse location', function () {
        beforeEach(function () {
            this.handlers = {
                'fronts': 'whatever',
                'peel': 'another',
                'something': 'yeah'
            };
            this.location = {
                pathname: '',
                search: ''
            };
        });

        it('from default', function () {
            var router = new Router(this.handlers, this.location);
            expect(router.priority).toBe(CONST.defaultPriority);
            expect(router.path).toBe('fronts');
            expect(router.handler).toBe(this.handlers.fronts);
            expect(router.params).toEqual({});
        });

        it('with priority', function () {
            this.location.pathname = '/banana';

            var router = new Router(this.handlers, this.location);
            expect(router.priority).toBe('banana');
            expect(router.path).toBe('fronts');
            expect(router.handler).toBe(this.handlers.fronts);
            expect(router.params).toEqual({});
        });

        it('with priority and handler', function () {
            this.location.pathname = '/apple/peel';

            var router = new Router(this.handlers, this.location);
            expect(router.priority).toBe('apple');
            expect(router.path).toBe('peel');
            expect(router.handler).toBe(this.handlers.peel);
            expect(router.params).toEqual({});
        });

        it('with priority and wrong handler', function () {
            this.location.pathname = '/pear/eat';

            var router = new Router(this.handlers, this.location);
            expect(router.priority).toBe('pear');
            expect(router.path).toBe('eat');
            expect(router.handler).toBeUndefined();
            expect(router.params).toEqual({});
        });

        it('with search parameters', function () {
            this.location.pathname = '/mango';
            this.location.search = '?ripe=already';

            var router = new Router(this.handlers, this.location);
            expect(router.priority).toBe('mango');
            expect(router.path).toBe('fronts');
            expect(router.handler).toBe(this.handlers.fronts);
            expect(router.params).toEqual({
                ripe: 'already'
            });
        });
    });

    describe('load', function () {
        var description = {
            fronts: function () {}
        };

        it('correctly', function (done) {
            spyOn(description, 'fronts').and.callFake(() => Promise.resolve());

            var router = new Router(description, {
                pathname: '/blueberry',
                search: '?fruit=maybe'
            });

            router.load(12).then(function () {
                expect(description.fronts).toHaveBeenCalledWith(router, 12);
                done();
            });
        });

        it('fails', function (done) {
            spyOn(description, 'fronts');

            var router = new Router(description, {
                pathname: '/raspberry/squeeze'
            });

            router.load().catch(function (err) {
                expect(err.message).toMatch(/undefined/i);
                done();
            });
        });
    });

    describe('navigate', function () {
        it('from an empty search', function () {
            var history = {
                pushState: function () {}
            },
            location = {
                pathname: '/navigate',
                search: '?'
            },
            router = new Router([], location, history);
            spyOn(history, 'pushState').and.callFake(fakePushState.bind(location));

            router.navigate({
                fruit: 'apple:green,banana'
            });
            expect(history.pushState).toHaveBeenCalled();
            expect(location.pathname).toBe('/navigate');
            expect(location.search).toBe('?fruit=apple:green,banana');
            expect(router.params).toEqual({ fruit: 'apple:green,banana' });
        });

        it('keeping the existing parameters', function () {
            var history = {
                pushState: function () {}
            },
            location = {
                pathname: '/navigate',
                search: '?color=yellow&fruit=banana'
            },
            router = new Router([], location, history);
            spyOn(history, 'pushState').and.callFake(fakePushState.bind(location));

            router.navigate({
                fruit: 'lemon'
            });
            expect(history.pushState).toHaveBeenCalled();
            expect(location.pathname).toBe('/navigate');
            expect(location.search).toBe('?color=yellow&fruit=lemon');
            expect(router.params).toEqual({
                color: 'yellow',
                fruit: 'lemon'
            });
        });

        it('does not navigate if the url doesn\'t change', function () {
            var history = {
                pushState: function () {}
            },
            location = {
                pathname: '/navigate',
                search: '?color=red&fruit=strawberry'
            },
            router = new Router([], location, history);
            spyOn(history, 'pushState').and.callFake(fakePushState.bind(location));

            router.navigate({
                fruit: 'strawberry'
            });
            expect(history.pushState).not.toHaveBeenCalled();
            expect(location.pathname).toBe('/navigate');
            expect(location.search).toBe('?color=red&fruit=strawberry');
            expect(router.params).toEqual({
                color: 'red',
                fruit: 'strawberry'
            });
        });

        it('popstate', function () {
            var location = {
                pathname: '/first',
                search: '?fruit=juice'
            },
            router = new Router([], location, {}),
            spy = jasmine.createSpy('spy');

            router.on('change', spy);
            location.pathname = '/second/link';
            location.search = '?fruit=shake';

            router.onpopstate();

            expect(spy).toHaveBeenCalled();
            expect(router.priority).toBe('second');
            expect(router.path).toBe('link');
            expect(router.params).toEqual({
                fruit: 'shake'
            });
            router.off(spy);
        });
    });
});
