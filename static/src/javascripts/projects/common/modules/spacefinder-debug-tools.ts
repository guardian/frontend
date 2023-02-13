import type {
	SpacefinderExclusions,
	SpacefinderItem,
	SpacefinderRules,
} from './spacefinder';

const colours = {
	red: 'rgb(255 178 178)',
	darkRed: 'rgb(200 0 0)',
	orange: 'rgb(255 213 178)',
	yellow: 'rgb(254 255 178)',
	blue: 'rgb(178 248 255)',
	darkBlue: 'rgb(0 0 178)',
	purple: 'rgb(178 178 255)',
	pink: 'rgb(255 178 242)',
	green: 'rgb(178 255 184)',
	darkGreen: 'rgb(0 128 0)',
};

const exclusionTypes = {
	absoluteMinAbove: {
		colour: colours.red,
		reason: 'Too close to the top of page',
	},
	aboveAndBelow: {
		colour: colours.orange,
		reason: 'Too close to top or bottom of article',
	},
	isStartAt: {
		colour: colours.purple,
		reason: 'Spacefinder is starting from this position',
	},
	startAt: {
		colour: colours.orange,
		reason: 'Before the starting element',
	},
	custom: {
		colour: colours.yellow,
		reason: 'Too close to other winner',
	},
} as const;

const isExclusionType = (type: string): type is keyof typeof exclusionTypes =>
	type in exclusionTypes;

const addOverlay = (element: HTMLElement, text: string) => {
	const explainer = document.createElement('div');
	explainer.className = 'overlay sfdebug';
	explainer.appendChild(document.createTextNode(text));
	explainer.style.cssText = `
		position:absolute;
		right:0;
		background-color:${colours.red};
		padding:5px 5px 10px 20px;
		font-family: sans-serif;
		z-index:20;
	`;
	element.before(explainer);
};

const addHoverListener = (
	candidate: HTMLElement,
	tooClose: Exclude<SpacefinderItem['meta'], undefined>['tooClose'],
) => {
	tooClose.forEach((opponent) => {
		candidate.addEventListener('mouseenter', () => {
			opponent.element.style.cssText = `
				box-shadow: 0px 0px 0px 10px ${colours.red};
				z-index:10;
				position:relative
			`;

			addOverlay(
				opponent.element,
				`${opponent.actual}px/${opponent.required}px`,
			);
		});

		candidate.addEventListener('mouseleave', () => {
			opponent.element.style.cssText = '';
			document
				.querySelectorAll('.sfdebug.overlay')
				.forEach((el) => el.remove());
		});
	});
};

const addExplainer = (element: HTMLElement, text: string) => {
	const explainer = document.createElement('div');
	explainer.className = 'sfdebug';
	explainer.appendChild(document.createTextNode(text));
	explainer.style.cssText = `
		position:absolute;
		right:0;
		background-color:#fffffff7;
		padding:10px;
		border-radius:0 0 0 10px;
		font-family: sans-serif;
	`;
	element.before(explainer);
};

const debugMinAbove = (body: HTMLElement, minAbove: number): void => {
	body.style.position = 'relative';

	const minAboveIndicator = document.createElement('div');
	minAboveIndicator.className = 'sfdebug';

	minAboveIndicator.style.cssText = `
		position: absolute;
		top: ${minAbove}px;
		width: 100%;
		background-color: ${colours.darkBlue};
		height: 5px;
	`;

	minAboveIndicator.innerHTML = `
		<div class="sfdebug"
		     style="position: absolute;
			 		right: 0px;
					background-color: rgba(255, 255, 255, 0.97);
					padding: 10px;
					border-radius: 0px 0px 0px 10px;
					font-family: sans-serif;
					font-size: 0.7rem;">
			Threshold for slot to be too close to top (minAbove: ${minAbove}px)
		</div>`;

	body.appendChild(minAboveIndicator);
};

const markLosingCandidates = (
	exclusions: SpacefinderExclusions,
	rules: SpacefinderRules,
) => {
	for (const [key, arr] of Object.entries(exclusions)) {
		arr.forEach((exclusion) => {
			const type = isExclusionType(key) && exclusionTypes[key];

			const element =
				exclusion instanceof Element ? exclusion : exclusion.element;
			const meta = exclusion instanceof Element ? null : exclusion.meta;

			if (element == rules.startAt) {
				const type = exclusionTypes.isStartAt;
				addExplainer(element, type.reason);
				element.style.cssText += `background:${type.colour}`;
			} else if (type) {
				addExplainer(element, type.reason);
				element.style.cssText += `background:${type.colour}`;
			} else if (meta && meta.tooClose.length > 0) {
				addExplainer(element, 'Too close to other element');
				element.style.cssText += `background:${colours.blue}`;
				addHoverListener(element, meta.tooClose);
			} else {
				addExplainer(element, `Unknown key: ${key}`);
				element.style.cssText += `background:${colours.pink}`;
			}
		});
	}
};

const markWinningCandidates = (winners: SpacefinderItem[]) => {
	winners.forEach((winner) => {
		addExplainer(winner.element, 'Winner');
		winner.element.style.cssText += `background:${colours.green};`;
		winner.element.style.cssText += `outline: thick solid ${colours.darkGreen};`;
	});
};

const annotateCandidates = (
	exclusions: SpacefinderExclusions,
	winners: SpacefinderItem[],
	rules: SpacefinderRules,
): void => {
	try {
		markLosingCandidates(exclusions, rules);
		markWinningCandidates(winners);
	} catch (e) {
		console.error('SFDebug Error', e);
	}
};

const runDebugTool = (
	exclusions: SpacefinderExclusions = {},
	winners: SpacefinderItem[],
	rules: SpacefinderRules,
): void => {
	document.addEventListener(
		'adverts-created',
		() => {
			if (rules.minAbove && rules.body instanceof HTMLElement) {
				debugMinAbove(rules.body, rules.minAbove);
			}

			annotateCandidates(exclusions, winners, rules);
		},
		{ once: true }, // Don't run when adverts refresh
	);
};

const createAdvertBorder = (advert: HTMLElement): void => {
	document.addEventListener(
		'adverts-created',
		() => {
			advert.style.cssText += `outline: 4px solid ${colours.darkRed};`;
		},
		{ once: true }, // Don't run when adverts refresh
	);
};

export { createAdvertBorder, runDebugTool };
