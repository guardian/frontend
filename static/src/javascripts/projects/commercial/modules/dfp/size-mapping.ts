import type { AdSize } from '@guardian/commercial-core';
import type { Breakpoint } from '@guardian/src-foundations';

export type SizeMappings = {
	[B in Breakpoint]?: AdSize[];
};

type SizeMappingsString = {
	[B in Breakpoint]?: string;
};

export const mergeSizeMappings = (
	sizeMappings1: SizeMappings,
	sizeMappings2?: SizeMappings,
): SizeMappings => {
	const mergedMappings: SizeMappings = { ...sizeMappings1 };
	if (sizeMappings2) {
		(Object.keys(sizeMappings2) as Breakpoint[]).forEach((optionSize) => {
			const optionSizesArray = sizeMappings2[optionSize];
			const mergedSize = mergedMappings[optionSize];
			if (optionSizesArray !== undefined) {
				mergedMappings[optionSize] =
					mergedSize !== undefined
						? mergedSize.concat(optionSizesArray)
						: optionSizesArray;
			}
		});
	}
	return mergedMappings;
};

const sizeMappingToString = (sizeMapping: AdSize[]): string =>
	sizeMapping.map((adSize) => adSize.toString()).join('|');

export const sizeMappingsToString = (
	sizeMappings: SizeMappings,
): SizeMappingsString => {
	const sizeMappingsString: SizeMappingsString = {};
	(Object.keys(sizeMappings) as Breakpoint[]).forEach((breakpoint) => {
		const sizeMapping = sizeMappings[breakpoint];
		if (sizeMapping !== undefined) {
			sizeMappingsString[breakpoint] = sizeMappingToString(sizeMapping);
		}
	});
	return sizeMappingsString;
};
