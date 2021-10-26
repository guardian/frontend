import type { AdSize } from '@guardian/commercial-core';
import type { Breakpoint } from '@guardian/src-foundations';

export type SizeMappings = {
	[B in Breakpoint]?: AdSize[];
};

type SizeMappingsString = {
	[B in Breakpoint]?: string;
};

export const concatSizeMappings = (
	sizeMappings1: SizeMappings,
	sizeMappings2: SizeMappings,
): SizeMappings =>
	(Object.keys(sizeMappings2) as Breakpoint[]).reduce<SizeMappings>(
		(concatMappings, size) => {
			concatMappings[size] = (concatMappings[size] ?? []).concat(
				sizeMappings2[size] ?? [],
			);
			return concatMappings;
		},
		{ ...sizeMappings1 },
	);

const sizeMappingToString = (sizeMapping: AdSize[]): string =>
	sizeMapping.map((adSize) => adSize.toString()).join('|');

export const sizeMappingsToString = (
	sizeMappings: SizeMappings,
): SizeMappingsString =>
	(Object.keys(sizeMappings) as Breakpoint[]).reduce<SizeMappingsString>(
		(sizeMappingsString, breakpoint) => {
			const sizeMapping = sizeMappings[breakpoint];
			if (sizeMapping !== undefined) {
				sizeMappingsString[breakpoint] = sizeMappingToString(
					sizeMapping,
				);
			}
			return sizeMappingsString;
		},
		{},
	);
