// @flow

export const wrappedElementsFromString = (
    tagName: string,
    html: string
): Element => {
    const wrapper = document.createElement(tagName);
    wrapper.innerHTML = html;
    return wrapper;
};

export const elementFromString = (html: string): ?Element =>
    wrappedElementsFromString('div', html).firstElementChild;

export const elementsFromString = (html: string): Array<Element> => [
    ...wrappedElementsFromString('div', html).children,
];

export const insertAfter = (
    elementToInsert: Element,
    elementToInsertAfter: Element
): void => {
    const parent = elementToInsertAfter.parentNode;
    if (parent) {
        if (elementToInsertAfter.nextSibling) {
            parent.insertBefore(
                elementToInsert,
                elementToInsertAfter.nextSibling
            );
        } else {
            parent.appendChild(elementToInsert);
        }
    }
};

export const insertBefore = (
    elementToInsert: Element,
    elementToInsertBefore: Element
): void => {
    const parent = elementToInsertBefore.parentNode;
    if (parent) {
        parent.insertBefore(elementToInsert, elementToInsertBefore);
    }
};
