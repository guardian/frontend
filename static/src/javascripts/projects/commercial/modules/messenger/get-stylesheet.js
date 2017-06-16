// @flow
import { register } from 'commercial/modules/messenger';

type Specs = {
    selector: string,
};

const getStyles = (specs: Specs, styleSheets: StyleSheetList): ?Array<any> => {
    if (!specs || typeof specs.selector !== 'string') {
        return null;
    }

    const result = [];
    for (let i = 0; i < styleSheets.length; i += 1) {
        const sheet: StyleSheet = styleSheets[i];
        // #? Why are we coercing the Type to `Object` rather than being more
        // specific? Flow typing of `Node` does not account for `matches` or
        // `tagName` but the code below works. Could we use `nodeName` instead?
        const ownerNode: Object = sheet.ownerNode;

        if (
            ownerNode &&
            ownerNode.matches &&
            ownerNode.matches(specs.selector)
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

export { getStyles };
