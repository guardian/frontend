// @flow
import type { RegisterListeners } from 'commercial/modules/messenger';

type Specs = {
    selector: string,
};

const getStyles = (specs: Specs, styleSheets: StyleSheetList): ?Array<any> => {
    if (!specs || typeof specs.selector !== 'string') {
        return null;
    }

    const result = [];
    for (let i = 0; i < styleSheets.length; i += 1) {
        const sheet: CSSStyleSheet = (styleSheets[i]: any);
        const ownerNode: Element = (sheet.ownerNode: any);

        if (
            ownerNode &&
            ownerNode.matches &&
            ownerNode.matches(specs.selector)
        ) {
            if (ownerNode.tagName === 'STYLE') {
                result.push(ownerNode.textContent);
            } else {
                result.push(
                    Array.prototype.reduce.call(
                        sheet.cssRules || [],
                        (res, input) => res + input.cssText,
                        ''
                    )
                );
            }
        }
    }
    return result;
};

const init = (register: RegisterListeners) => {
    register(
        'get-styles',
        (specs): ?Array<any> => {
            if (specs) {
                return getStyles(specs, document.styleSheets);
            }
        }
    );
};

export const _ = { getStyles };

export { init, getStyles };
