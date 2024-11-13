const init = () => {
	const $switchboard = document.querySelector('#switchboard');
	if (!$switchboard) return;

	const $highImpactSwitches = Array.from(
		$switchboard.querySelectorAll('input[data-high-impact="true"]'),
	);
	const $saveButton = document.querySelector('input[value="Save"]');

	if (!$highImpactSwitches.length) return;

	$highImpactSwitches.forEach(($highImpactSwitch) => {
		$highImpactSwitch.addEventListener('change', (event) => {
			event.preventDefault();

			const changeCancelled = !confirm(
				$highImpactSwitch.dataset.impactWarning,
			);
			if (changeCancelled) {
				event.currentTarget.checked = !event.currentTarget.checked;
			}

			const $makeButtonScary = $highImpactSwitches.some(
				($hiSwitch) => !$hiSwitch.checked,
			);
			if ($makeButtonScary) {
				$saveButton.classList.add('btn-danger');
			} else {
				$saveButton.classList.remove('btn-danger');
			}
		});
	});
};

export { init };
