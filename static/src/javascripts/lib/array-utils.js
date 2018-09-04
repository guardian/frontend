// @flow

const isLastElement = (elementIndex: number, arrayLength: number): boolean => elementIndex + 1 === arrayLength;

export const appendToLastElement = (array: Array<string>, stringToAppend: string): Array<string> =>
    array.map((element, index) => isLastElement(index, array.length) ? `${element}${stringToAppend}` : element)
