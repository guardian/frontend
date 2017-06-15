// @flow
import { register } from 'commercial/modules/messenger';

type Specs = {
    selector: string,
};

type Sheet = {
    ownerNode: Element,
};

const getStyles = (specs: Specs, styleSheets: Object): ?Array<any> => {
    if (!specs || typeof specs.selector !== 'string') {
        return null;
    }

    const result = [];
    for (let i = 0; i < styleSheets.length; i += 1) {
        const sheet: Sheet = styleSheets[i];
        if (
            sheet.ownerNode &&
            sheet.ownerNode.matches &&
            sheet.ownerNode.matches(specs.selector)
        ) {
            if (sheet.ownerNode.tagName === 'STYLE') {
                result.push(sheet.ownerNode.textContent);
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

register('get-styles', (specs): ?Array<any> => {
    if (specs) {
        return getStyles(specs, document.styleSheets);
    }
});

export default { getStyles };
