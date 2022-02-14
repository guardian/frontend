const adSlotClassSelectorSizes = {
	minAbove: 500,
	minBelow: 500,
};

type SpacefinderItem = {
	top: number;
	bottom: number;
	element: HTMLElement;
};

// this facilitates a second filtering, now taking into account the candidates' position/size relative to the other candidates
export const filterNearbyCandidatesFixed =
	(maximumAdHeight: number) =>
	(
		candidate: SpacefinderItem,
		lastWinner: SpacefinderItem | undefined,
	): boolean => {
		if (
			!lastWinner ||
			Math.abs(candidate.top - lastWinner.top) - maximumAdHeight >=
				adSlotClassSelectorSizes.minBelow
		) {
			return true;
		}
		return false;
	};
