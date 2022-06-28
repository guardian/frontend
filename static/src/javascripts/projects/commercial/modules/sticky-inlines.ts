import { isUndefined } from '@guardian/libs';
import fastdom from 'lib/fastdom-promise';

/**
 * Represents an element that has some presence in the right column that we need to account for
 */
type RightColItem = {
	/**
	 * The kind of elements that extend into the right column:
	 * - `figure`: Immersive figures (images, interactives) can extend into the right column
	 * - `winningPara`: Paragraphs that win Spacefinder will have an ad placed in the right column
	 */
	kind: 'figure' | 'winningPara';
	top: number;
	element: HTMLElement;
};

/**
 * The minimum buffer between two adverts (aka winning paragraphs) in the right column
 */
const paragraphBufferPx = 600;

/**
 * The minimum buffer between a right column advert and an immersive element
 */
const immersiveBufferPx = 100;

/**
 * The minimum buffer between a right column advert and the bottom of the article body
 */
const articleBottomBufferPx = 100;

/**
 * Compute the distance between each winning paragraph and subsequent paragraph,
 * taking into account elements that extend into the right column
 */
const computeStickyHeights = async (
	winners: HTMLElement[],
	articleBodySelector: string,
): Promise<number[]> => {
	// Immersive figures can extend into the right column
	// Therefore we have to take them into account when we can compute how far an ad can be sticky for
	const immersiveFigures = [
		...document.querySelectorAll<HTMLElement>(
			'[data-spacefinder-role="immersive"]',
		),
	];

	const { figures, winningParas, articleBodyElementHeightBottom } =
		await fastdom.measure(() => {
			const figures: RightColItem[] = immersiveFigures.map((element) => ({
				kind: 'figure',
				top: element.getBoundingClientRect().top,
				element,
			}));

			const winningParas: RightColItem[] = winners.map((element) => ({
				kind: 'winningPara',
				top: element.getBoundingClientRect().top,
				element,
			}));

			const articleBodyElementHeightBottom =
				document
					.querySelector<HTMLElement>(articleBodySelector)
					?.getBoundingClientRect().bottom ?? 0;

			return { figures, winningParas, articleBodyElementHeightBottom };
		});

	return (
		// Concat the set of figures and winning paragraphs in the article
		[...figures, ...winningParas]
			// Sort so they appear in order of their top coordinates
			.sort((first, second) => first.top - second.top)
			// Step through each one by one, measuring the height we can make the container of the ad slot
			.map((current, index, items) => {
				// We don't care about computing the distance *from* figures
				// These will be filtered out in the next step
				if (current.kind === 'figure') {
					return undefined;
				}

				// Retrieve the next element to which we'll extend the container height
				// This can be undefined if there is no next item
				const next = items[index + 1] as RightColItem | undefined;

				// If there is no `next` element we've reached the final element in the article body
				// In this case we want to make the sticky distance extend until the bottom of the article body,
				// minus a small constant buffer
				if (next === undefined) {
					return (
						articleBodyElementHeightBottom -
						current.top -
						articleBottomBufferPx
					);
				}

				// Choose height of buffer depending on the kind of element we're measuring to
				const buffer =
					next.kind === 'winningPara'
						? paragraphBufferPx
						: immersiveBufferPx;

				// Compute the distance from the top of the current element to the top of the next element, minus the buffer
				return Math.floor(next.top - current.top - buffer);
			})
			// Remove the figures marked as undefined
			// In effect keeping only the heights for winning paragraphs
			.filter((height): height is number => !isUndefined(height))
	);
};

export { computeStickyHeights };
