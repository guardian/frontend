import bean from 'bean';
import { fetchJson as fetchJson_ } from 'lib/fetch-json';

import { Component } from './component';

const fetchJson = (fetchJson_);

const mockResponse = {
    html: '<p>html</p>',
    other: '<p>other</p>',
};

const createComponent = (props = {}) => {
    const component = new Component();
    const defaults = {
        endpoint: 'whatever',
    };

    Object.assign(component, defaults, props);

    return component;
};

jest.mock('lib/fetch-json', () => ({
	fetchJson: jest.fn(() => Promise.resolve(mockResponse)),
}));

jest.mock('bean', () => ({
    off: jest.fn(),
}));

describe('Component', () => {
    let elem;
    let subElem;

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
                <div class="component">
                    <div class="component__element"></div>
                </div>
            `;
        }

        // Apologies for the typecast, but it makes things just way easier ...
        elem = ((document.querySelector('.component')));
        subElem = ((document.querySelector(
            '.component__element'
        )));
    });

    describe('fetch()', () => {
        test('call fetched() with an endpoint', () => {
            const component = createComponent({
                fetched: jest.fn(),
            });

            return component.fetch(elem).then(() => {
                expect(component.fetched).toHaveBeenCalledWith(mockResponse);
            });
        });

        test('not call fetched() without an endpoint', () => {
            const component = createComponent({
                endpoint: false,
                fetched: jest.fn(),
            });

            return component.fetch(elem).then(() => {
                expect(component.fetched).not.toHaveBeenCalled();
            });
        });

        test('extract the content of `html` in response by default', () => {
            const component = createComponent({
                fetched: jest.fn(),
            });

            return component.fetch(elem).then(() => {
                if (!component.elem) {
                    return Promise.reject(
                        new Error('.elem property should exist')
                    );
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

            return component.fetch(elem, 'other').then(() => {
                if (!component.elem) {
                    return Promise.reject(
                        new Error('.elem property should exist')
                    );
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

            return component.fetch(elem).then(() => {
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

            return component.fetch(elem).then(() => {
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

            fetchJson.mockReturnValueOnce(Promise.reject(mockError));

            return component.fetch(elem).catch(() => {
                expect(component.ready).toHaveBeenCalled();
                expect(component.error).toHaveBeenCalledWith(mockError);
            });
        });
    });

    describe('getClass()', () => {
        test('should return proper class name with BEM', () => {
            const component = createComponent({
                componentClass: 'component',
                useBem: true,
            });

            expect(component.getClass('element')).toBe('.component__element');
            expect(component.getClass('element', true)).toBe(
                'component__element'
            );
        });

        test('should return proper class name without BEM', () => {
            const component = createComponent({
                classes: {
                    element: 'my-element-class',
                },
            });

            expect(component.getClass('element')).toBe('.my-element-class');
            expect(component.getClass('element', true)).toBe(
                'my-element-class'
            );
            expect(component.getClass('element-2')).toBeUndefined();
            expect(component.getClass('element-2', true)).toBeUndefined();
        });
    });

    describe('setOptions()', () => {
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

    describe('setState(), removeState(), toggleState()', () => {
        let component;

        beforeEach(() => {
            component = createComponent({
                componentClass: 'component',
            });

            component.attachTo(elem);
        });

        test('setState() should add class name to elem (without elementName)', () => {
            component.setState('state');

            if (component.elem) {
                expect(
                    component.elem.classList.contains('component--state')
                ).toBe(true);
            }
        });

        test('setState() should add class name to elem (with elementName)', () => {
            component.setState('state', 'element');

            if (subElem) {
                expect(
                    subElem.classList.contains('component__element--state')
                ).toBe(true);
            }
        });

        test('removeState() should remove class name to elem (without elementName)', () => {
            component.setState('state');
            component.removeState('state');

            if (component.elem) {
                expect(
                    component.elem.classList.contains('component--state')
                ).toBe(false);
            }
        });

        test('removeState() should remove class name to elem (with elementName)', () => {
            component.setState('state', 'element');
            component.removeState('state', 'element');

            if (subElem) {
                expect(
                    subElem.classList.contains('component__element--state')
                ).toBe(false);
            }
        });

        test('toggleState() should toggle class name to elem (without elementName)', () => {
            component.toggleState('state');

            if (component.elem) {
                expect(
                    component.elem.classList.contains('component--state')
                ).toBe(true);
            }

            component.toggleState('state');

            if (component.elem) {
                expect(
                    component.elem.classList.contains('component--state')
                ).toBe(false);
            }
        });

        test('toggleState() should toggle class name to elem (with elementName)', () => {
            component.toggleState('state', 'element');

            if (subElem) {
                expect(
                    subElem.classList.contains('component__element--state')
                ).toBe(true);
            }

            component.toggleState('state', 'element');

            if (subElem) {
                expect(
                    subElem.classList.contains('component__element--state')
                ).toBe(false);
            }
        });

        test('hasState() should return the proper state (without elementName)', () => {
            component.setState('state');
            expect(component.hasState('state')).toBe(true);
            expect(component.hasState('whatever')).toBe(false);
        });

        test('hasState() should return the proper state (with elementName)', () => {
            component.setState('state', 'element');
            expect(component.hasState('state', 'element')).toBe(true);
            expect(component.hasState('whatever', 'element')).toBe(false);
        });

        test('hasState() should always return false without componentClass', () => {
            component.componentClass = '';

            component.setState('state', 'element');
            expect(component.hasState('state')).toBe(false);
            expect(component.hasState('state', 'element')).toBe(false);
        });
    });

    describe('attachTo()', () => {
        test('calls ready() callback', () => {
            const component = createComponent({
                ready: jest.fn(),
            });

            if (elem) {
                component.attachTo(elem);
                expect(component.ready).toHaveBeenCalled();
            }
        });

        test('calls prerender() callback', () => {
            const component = createComponent({
                prerender: jest.fn(),
            });

            if (elem) {
                component.attachTo(elem);
                expect(component.prerender).toHaveBeenCalled();
            }
        });

        test('calls checkAttached() callback', () => {
            const component = createComponent({
                checkAttached: jest.fn(),
            });

            if (elem) {
                component.attachTo(elem);
                expect(component.checkAttached).toHaveBeenCalled();
            }
        });
    });

    describe('destroy()', () => {
        test('cleans up the instance', () => {
            const component = createComponent({
                elem: document.createElement('p'),
            });

            component.destroy();

            expect(component.elem).not.toBeDefined();
            expect(component.t).toBe(null);
            expect(bean.off).toHaveBeenCalledWith(component.elem);
        });
    });
});
