const init = () => {
    const $switchboard = ((document.querySelector(
        '#switchboard'
    )));
    if (!$switchboard) return;

    const $highImpactSwitches = $switchboard.querySelectorAll('[data-high-impact="true"]');
    const $saveButton = document.querySelector('input[value="Save"]');

    if (!$highImpactSwitches.length) return;

    $highImpactSwitches.forEach($highImpactSwitch => {
        $highImpactSwitch.addEventListener('change', (event) => {
            event.preventDefault();
            const changeCancelled = !confirm($highImpactSwitch.dataset.impactWarning);
            if (changeCancelled) {
                event.currentTarget.checked = !event.currentTarget.checked;
            } else {
                $saveButton.classList.add('btn-danger');
            }
        });
    })
};

export { init }
