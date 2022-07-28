const isLastElement = (elementIndex, arrayLength) =>
	elementIndex + 1 === arrayLength;

export const appendToLastElement = (array, stringToAppend) =>
	array.map((element, index) =>
		isLastElement(index, array.length)
			? `${element}${stringToAppend}`
			: element,
	);

export const throwIfEmptyArray = (name, array) => {
	if (Array.isArray(array) && array.length > 0) {
		return array;
	}

	throw new Error(`${name} is empty`);
};
