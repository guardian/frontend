const adSlotClassSelectorSizes = {
	minAbove: 500,
	minBelow: 500,
};

type SpacefinderItem = {
	top: number;
	bottom: number;
	element: HTMLElement;
};

let previousAllowedCandidate: SpacefinderItem | undefined;

// this facilitates a second filtering, now taking into account the candidates' position/size relative to the other candidates
export const filterNearbyCandidatesBroken =
	(maximumAdHeight: number) =>
	(candidate: SpacefinderItem): boolean => {
		if (
			!previousAllowedCandidate ||
			Math.abs(candidate.top - previousAllowedCandidate.top) -
				maximumAdHeight >=
				adSlotClassSelectorSizes.minBelow
		) {
			previousAllowedCandidate = candidate;
			return true;
		}
		return false;
	};
