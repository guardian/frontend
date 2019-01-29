// @flow
import lozad from './lozad';

const isIE = typeof document !== 'undefined' && document.documentMode;

export const lazyLoadImages = (): void => {
    const selector = '.lazy-load-img';

    const observer = lozad(selector, {
        rootMargin: '200px 0px', // load images before they are actually viewed
        load: element => {
            if (element.nodeName.toLowerCase() === 'picture') {
                const img = document.createElement('img');

                if (isIE && element.getAttribute('data-iesrc')) {
                    img.src = element.getAttribute('data-iesrc');
                }

                if (element.getAttribute('data-alt')) {
                    img.alt = element.getAttribute('data-alt');
                }

                // Applying classes is the main motivation for customising Lozad's loading function
                if (element.getAttribute('data-class')) {
                    img.className = element.getAttribute('data-class');
                }

                element.appendChild(img);
            }

            if (element.getAttribute('data-src')) {
                element.src = element.getAttribute('data-src');
            }

            if (element.getAttribute('data-srcset')) {
                element.setAttribute(
                    'srcset',
                    element.getAttribute('data-srcset')
                );
            }
        },
    });

    observer.observe();
};
