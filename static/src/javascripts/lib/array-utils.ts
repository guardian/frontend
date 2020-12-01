const isLastElement = (elementIndex: number, arrayLength: number): boolean =>
    elementIndex + 1 === arrayLength;

export const appendToLastElement = (
    array: string[],
    stringToAppend: string
): string[] =>
    array.map((element, index) =>
        isLastElement(index, array.length)
            ? `${element}${stringToAppend}`
            : element
    );

export const throwIfEmptyArray = (
    name: string,
    array: any[] | null | undefined
): any[] => {
    if (Array.isArray(array) && array.length > 0) {
        return array;
    }

    throw new Error(`${name} is empty`);
};
