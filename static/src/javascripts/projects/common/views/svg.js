// @flow
export const addClassesAndTitle = (
    markup: string,
    classes?: Array<string>,
    title?: string
): string => {
    // Only mess with classes if we actually need to.
    let markupWithClasses = markup;
    if (classes) {
        // #? Typchecking not needed anymore
        if (Array.isArray(classes)) {
            markupWithClasses = markupWithClasses.replace(
                /class="/,
                `class="${classes.join(' ')} `
            );
        } else if (window.console && window.console.error) {
            // Some environments don't support or don't always expose the console object
            window.console.error(
                `Classes for inlineSvg must be an array: ${classes}`
            );
        }
    }

    // Only mess with title if we actually need to.
    const markupWithTitle = title
        ? markupWithClasses.replace(/<span /, `<span title="${title}" `)
        : markupWithClasses;

    return markupWithTitle;
};
