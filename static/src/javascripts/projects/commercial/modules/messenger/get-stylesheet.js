const getStyles = (specs, styleSheets) => {
	if (!specs || typeof specs.selector !== 'string') {
		return null;
	}

	const result = [];
	for (let i = 0; i < styleSheets.length; i += 1) {
		const sheet = styleSheets[i];
		const ownerNode = sheet.ownerNode;

		if (
			ownerNode &&
			ownerNode.matches &&
			ownerNode.matches(specs.selector)
		) {
			if (ownerNode.tagName === 'STYLE') {
				result.push(ownerNode.textContent);
			} else {
				result.push(
					Array.prototype.reduce.call(
						sheet.cssRules || [],
						(res, input) => res + input.cssText,
						'',
					),
				);
			}
		}
	}
	return result;
};

const init = (register) => {
	register('get-styles', (specs) => {
		if (specs) {
			return getStyles(specs, document.styleSheets);
		}
	});
};

export const _ = { getStyles };

export { init, getStyles };
