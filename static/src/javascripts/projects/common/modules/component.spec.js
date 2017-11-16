// @flow

import fetchJSON from 'lib/fetch-json';

import { Component } from './component';

const mockResponse = {
    html: '<p>html</p>',
    other: '<p>other</p>',
};

const createComponent = (props?: Object = {}): Component => {
    const component = new Component();
    const defaults = {
        endpoint: 'whatever',
    };

    Object.assign(component, defaults, props);

    return component;
};

jest.mock('lib/fetch-json', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('Component - fetch()', () => {
    test('call fetched() with an endpoint', () => {
        const component = createComponent({
            fetched: jest.fn(),
        });

        return component.fetch().then(() => {
            expect(component.fetched).toHaveBeenCalledWith(mockResponse);
        });
    });

    test('not call fetched() without an endpoint', () => {
        const component = createComponent({
            endpoint: false,
            fetched: jest.fn(),
        });

        return component.fetch().then(() => {
            expect(component.fetched).not.toHaveBeenCalled();
        });
    });

    test('extract the content of `html` in response by default', () => {
        const component = createComponent({
            fetched: jest.fn(),
        });

        return component.fetch().then(() => {
            if (!component.elem) {
                return Promise.reject(new Error('.elem property should exist'));
            }

            if (component.elem) {
                expect(component.elem.tagName).toBe('P');
            }

            if (component.elem) {
                expect(component.elem.innerHTML).toBe('html');
            }

            expect(component.fetched).toHaveBeenCalledWith(mockResponse);
        });
    });

    test('properly extract data from response, if key was passed', () => {
        const component = createComponent({
            fetched: jest.fn(),
        });

        return component.fetch(undefined, 'other').then(() => {
            if (!component.elem) {
                return Promise.reject(new Error('.elem property should exist'));
            }

            expect(component.fetched).toHaveBeenCalledWith(mockResponse);

            if (component.elem) {
                expect(component.elem.innerHTML).toBe('other');
            }
        });
    });

    test('calls all required callbacks, but not error(), if everything works', () => {
        const component = createComponent({
            checkAttached: jest.fn(),
            fetched: jest.fn(),
            prerender: jest.fn(),
            ready: jest.fn(),
            error: jest.fn(),
        });

        return component.fetch().then(() => {
            expect(component.ready).toHaveBeenCalledWith(component.elem);
            expect(component.checkAttached).toHaveBeenCalled();
            expect(component.prerender).toHaveBeenCalled();
            expect(component.error).not.toHaveBeenCalled();
        });
    });

    test('does not call ready() if destroyed is set to true', () => {
        const component = createComponent({
            checkAttached: jest.fn(),
            destroyed: true,
            fetched: jest.fn(),
            prerender: jest.fn(),
            ready: jest.fn(),
            error: jest.fn(),
        });

        return component.fetch().then(() => {
            expect(component.ready).not.toHaveBeenCalled();
            expect(component.checkAttached).toHaveBeenCalled();
            expect(component.prerender).toHaveBeenCalled();
            expect(component.error).not.toHaveBeenCalled();
        });
    });

    test('calls error() if something went wrong', () => {
        const component = createComponent({
            ready: jest.fn(),
            error: jest.fn(),
        });
        const mockError = new Error('Bad response');

        fetchJSON.mockReturnValueOnce(Promise.reject(mockError));

        return component.fetch().catch(() => {
            expect(component.ready).toHaveBeenCalled();
            expect(component.error).toHaveBeenCalledWith(mockError);
        });
    });
});

describe('Component - getClass()', () => {
    test('should return proper class name with BEM', () => {
        const component = createComponent({
            componentClass: 'component',
            useBem: true,
        });

        expect(component.getClass('element')).toBe('.component__element');
        expect(component.getClass('element', true)).toBe('component__element');
    });

    test('should return proper class name without BEM', () => {
        const component = createComponent({
            classes: {
                element: 'my-element-class',
            },
        });

        expect(component.getClass('element')).toBe('.my-element-class');
        expect(component.getClass('element', true)).toBe('my-element-class');
        expect(component.getClass('element-2')).not.toBe(undefined);
        expect(component.getClass('element-2', true)).not.toBe('.');
    });
});

describe('Component - setOptions()', () => {
    test('extends options', () => {
        const component = createComponent();

        component.setOptions({
            a: 1,
            b: 2,
        });

        expect(component.options.a).toBe(1);
        expect(component.options.b).toBe(2);
    });

    test('extends options with defaultOptions', () => {
        const component = createComponent({
            defaultOptions: {
                a: 1,
                b: 2,
            },
        });

        component.setOptions({
            a: 3,
        });

        expect(component.options.a).toBe(3);
        expect(component.options.b).toBe(2);
    });

    test('extends options with defaultOptions and options', () => {
        const component = createComponent({
            defaultOptions: {
                a: 1,
                b: 2,
            },

            options: {
                a: 2,
                c: 5,
            },
        });

        component.setOptions({
            c: 6,
        });

        expect(component.options.a).toBe(2);
        expect(component.options.b).toBe(2);
        expect(component.options.c).toBe(6);
    });
});

describe('Component - destroy()', () => {
    test('calls detach()', () => {
        const component = createComponent({
            detach: jest.fn(),
        });

        component.destroy();

        expect(component.detach).toBeCalled();
    });

    test('deletes .elem', () => {
        const component = createComponent({
            elem: document.createElement('p'),
        });

        component.destroy();

        expect(component.elem).not.toBeDefined();
    });
});
