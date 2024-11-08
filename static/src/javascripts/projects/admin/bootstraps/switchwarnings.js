const init = () => {
    const $switchboard = ((document.querySelector(
        '#switchboard'
    )));
    if (!$switchboard) return;

    const $highImpactSwitches = $switchboard.querySelectorAll('[data-high-impact="true"]')

    if (!$highImpactSwitches.length) return;

    $highImpactSwitches.forEach($highImpactSwitch => {
        $highImpactSwitch.addEventListener('click', (event) => {
            if (!confirm($highImpactSwitch.dataset.impactWarning)) {
                event.preventDefault();
            }
        });
    })
};

export { init }
