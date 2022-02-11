export const markCandidates = (exclusions, winners, options) => {
	if (!options.debug) return winners;

	const colours = {
		red: 'rgb(255 178 178)',
		orange: 'rgb(255 213 178)',
		yellow: 'rgb(254 255 178)',
		blue: 'rgb(178 248 255)',
		pink: 'rgb(255 178 242)',
		green: 'rgb(178 255 184)',
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
		custom: {
			colour: colours.yellow,
			reason: 'Too close to other winner',
		},
	};

	const addHoverListener = (candidate, tooClose) => {
		tooClose.forEach((opponent) => {
			candidate.addEventListener(
				'mouseenter',
				() =>
					(opponent.style.cssText = `box-shadow: 0px 0px 0px 20px ${colours.blue}`),
			);

			candidate.addEventListener(
				'mouseleave',
				() => (opponent.style.cssText = ''),
			);
		});
	};

	const addExplainer = (element, text) => {
		const explainer = document.createElement('div');
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

	// Mark losing candidates
	for (const [key, arr] of Object.entries(exclusions)) {
		arr.forEach((exclusion) => {
			const type = exclusionTypes[key];

			if (type) {
				addExplainer(exclusion.element, type.reason);
				exclusion.element.style.cssText += `background:${type.colour}`;
			} else if (exclusion.meta.tooClose.length > 0) {
				addExplainer(exclusion.element, 'Too close to other element');
				exclusion.element.style.cssText += `background:${colours.blue}`;
				addHoverListener(exclusion.element, exclusion.meta.tooClose);
			} else {
				addExplainer(exclusion.element, `Unknown key: ${key}`);
				exclusion.element.style.cssText += `background:${colours.pink}`;
			}
		});
	}

	// Mark winning candidates
	winners.forEach((winner) => {
		addExplainer(winner.element, 'Winner');
		winner.element.style.cssText += `background:${colours.green};`;
	});

	return winners;
};
