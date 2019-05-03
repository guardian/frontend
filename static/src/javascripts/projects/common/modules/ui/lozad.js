// @flow

// (Inlined from: https://github.com/ApoorvSaxena/lozad.js)

// The MIT License (MIT)
//
// Copyright (c) 2017 Apoorv Saxena
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * Detect IE browser
 * @const {boolean}
 * @private
 */
const isIE = typeof document !== 'undefined' && document.documentMode;

const defaultConfig = {
    rootMargin: '0px',
    threshold: 0,
    load(element) {
        const iesrc = element.getAttribute('data-iesrc');
        const src = element.getAttribute('data-src');
        const alt = element.getAttribute('data-alt');
        const srcset = element.getAttribute('data-srcset');
        const backgroundImage = element.getAttribute('data-background-image');
        const toggleClass = element.getAttribute('data-toggle-class');

        if (element.nodeName.toLowerCase() === 'picture') {
            const img = document.createElement('img');
            if (isIE && iesrc) {
                img.src = iesrc;
            }
            if (alt) {
                img.alt = alt;
            }
            element.appendChild(img);
        }
        if (src) {
            element.src = src;
        }
        if (srcset) {
            element.setAttribute('srcset', srcset);
        }
        if (backgroundImage) {
            element.style.backgroundImage = `url('${backgroundImage}')`;
        }
        if (toggleClass) {
            element.classList.toggle(toggleClass);
        }
    },
    loaded() {},
};

const markAsLoaded = element => {
    element.setAttribute('data-loaded', 'true');
};

const isLoaded = element => element.getAttribute('data-loaded') === 'true';

const onIntersection = (load, loaded) => (entries, observer) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
            observer.unobserve(entry.target);

            if (!isLoaded(entry.target)) {
                load(entry.target);
                markAsLoaded(entry.target);
                loaded(entry.target);
            }
        }
    });
};

const getElements = (selector, root = document) => {
    if (selector instanceof Element) {
        return [selector];
    }
    if (selector instanceof NodeList) {
        return selector;
    }
    return root.querySelectorAll(selector);
};

export default function(selector: string = '.lozad', options: any = {}) {
    const { root, rootMargin, threshold, load, loaded } = {
        ...defaultConfig,
        ...options,
    };
    let observer;

    if (window.IntersectionObserver) {
        observer = new IntersectionObserver(onIntersection(load, loaded), {
            root,
            rootMargin,
            threshold,
        });
    }

    return {
        observe() {
            const elements = getElements(selector, root);

            for (let i = 0; i < elements.length; i += 1) {
                if (isLoaded(elements[i])) {
                    /* eslint-disable no-continue */
                    continue;
                }
                if (observer) {
                    observer.observe(elements[i]);
                    /* eslint-disable no-continue */
                    continue;
                }
                load(elements[i]);
                markAsLoaded(elements[i]);
                loaded(elements[i]);
            }
        },
        triggerLoad(element: any) {
            if (isLoaded(element)) {
                return;
            }

            load(element);
            markAsLoaded(element);
            loaded(element);
        },
        observer,
    };
}
