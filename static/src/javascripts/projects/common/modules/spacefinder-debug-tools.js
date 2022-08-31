const markCandidates = (exclusions, winners, options, rules) => {
	if (!options?.debug) return winners;

	const colours = {
		red: 'rgb(255 178 178)',
		orange: 'rgb(255 213 178)',
		yellow: 'rgb(254 255 178)',
		blue: 'rgb(178 248 255)',
        purple: 'rgb(178 178 255)',
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
	};

	const addDistanceExplainer = (element, text) => {
		const explainer = document.createElement('div');
		explainer.className = 'distanceExplainer sfdebug';
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

	// Mark losing candidates
	for (const [key, arr] of Object.entries(exclusions)) {
		arr.forEach((exclusion) => {
			const type = exclusionTypes[key];

            const element = exclusion instanceof Element ? exclusion : exclusion.element;
            const meta = exclusion instanceof Element ? null : exclusion;

            if (element == rules?.startAt) {
                const type = exclusionTypes.isStartAt;
                addExplainer(element, type.reason);
                element.style.cssText += `background:${type.colour}`;
            }else if (type) {
				addExplainer(element, type.reason);
				element.style.cssText += `background:${type.colour}`;
			} else if (meta?.tooClose.length > 0) {
				addExplainer(element, 'Too close to other element');
				element.style.cssText += `background:${colours.blue}`;
				addHoverListener(element, meta?.tooClose);
			} else {
				addExplainer(element, `Unknown key: ${key}`);
				element.style.cssText += `background:${colours.pink}`;
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
	minAboveIndicator.className = 'sfdebug';

	minAboveIndicator.style.cssText = `
		position: absolute;
		top: ${minAbove}px;
		width: 100%;
		background-color: red;
		height: 5px;
	`;

	minAboveIndicator.innerHTML = `<div class="sfdebug" style="position: absolute; right: 0px; background-color: rgba(255, 255, 255, 0.97); padding: 10px; border-radius: 0px 0px 0px 10px; font-family: sans-serif; font-size: 0.7rem;">Threshold for slot to be too close to top (minAbove: ${minAbove}px)</div>`;

	body.appendChild(minAboveIndicator);
};

export { markCandidates, debugMinAbove };
