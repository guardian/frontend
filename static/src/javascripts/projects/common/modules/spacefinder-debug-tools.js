const markCandidates = (exclusions, winners, options) => {
	if (!options?.debug) return winners;

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

	const addDistanceExplainer = (element, text) => {
		const explainer = document.createElement('div');
		explainer.className = 'distanceExplainer';
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

	const addHoverListener = (candidate, tooClose) => {
		tooClose.forEach((opponent) => {
			candidate.addEventListener('mouseenter', () => {
				opponent.element.style.cssText = `
                    box-shadow: 0px 0px 0px 10px ${colours.red};
                    z-index:10;
                    position:relative
                `;

				addDistanceExplainer(
					opponent.element,
					`${opponent.actual}px/${opponent.required}px`,
				);
			});

			candidate.addEventListener('mouseleave', () => {
				opponent.element.style.cssText = '';
				document
					.querySelectorAll('.distanceExplainer')
					.forEach((el) => el.remove());
			});
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

const debugMinAbove = (body, minAbove) => {
	body.style.position = 'relative';

	const minAboveIndicator = document.createElement('div');

	minAboveIndicator.style.cssText = `
		position: absolute;
		top: ${minAbove}px;
		width: 100%;
		background-color: red;
		height: 5px;
	`;

	minAboveIndicator.innerHTML = `<div style="position: absolute; right: 0px; background-color: rgba(255, 255, 255, 0.97); padding: 10px; border-radius: 0px 0px 0px 10px; font-family: sans-serif; font-size: 0.7rem;">Threshold for slot to be too close to top (minAbove: ${minAbove}px)</div>`;

	body.appendChild(minAboveIndicator);
};

export { markCandidates, debugMinAbove };
