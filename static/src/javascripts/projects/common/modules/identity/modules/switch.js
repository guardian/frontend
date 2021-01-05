import fastdom from 'lib/fastdom-promise';

const timeouts = [];

const checkboxShouldUpdate = (
    checkedValue,
    originallyCheckedValue
) => {
    if (
        (originallyCheckedValue === 'false' && checkedValue === true) ||
        (originallyCheckedValue === 'true' && checkedValue === false)
    ) {
        return true;
    }
    return false;
};

const updateDataLink = (labelEl, checked) =>
    fastdom.mutate(() => {
        labelEl.dataset.linkName = labelEl.dataset.linkNameTemplate.replace(
            '[action]',
            checked ? 'untick' : 'tick'
        );
    });

export const bindAnalyticsEventsOnce = (labelEl) =>
    fastdom
        .measure(() => labelEl.querySelector('input'))
        .then((checkboxEl) => {
            if (!labelEl.dataset.updateDataLinkBound) {
                labelEl.addEventListener('change', () => {
                    updateDataLink(labelEl, checkboxEl.checked);
                });
                labelEl.dataset.updateDataLinkBound = 'true';
                updateDataLink(labelEl, checkboxEl.checked);
            }
        });

export const getInfo = (labelEl) =>
    bindAnalyticsEventsOnce(labelEl)
        .then(() =>
            fastdom.measure(() => labelEl.querySelector('input'))
        )
        .then((checkboxEl) => {
            if (!labelEl.dataset.updateDataLinkBound) {
                labelEl.addEventListener('change', () => {
                    updateDataLink(labelEl, checkboxEl.checked);
                });
                labelEl.dataset.updateDataLinkBound = 'true';
                updateDataLink(labelEl, checkboxEl.checked);
            }
            return checkboxEl;
        })
        .then((checkboxEl) => ({
            checked: checkboxEl.checked,
            name: checkboxEl.name,
            shouldUpdate: checkboxShouldUpdate(
                checkboxEl.checked,
                labelEl.dataset.originallyChecked
            ),
        }));

export const flip = (labelEl) =>
    fastdom
        .measure(() => labelEl.querySelector('input'))
        .then((checkboxEl) => {
            fastdom.mutate(() => {
                checkboxEl.checked = !checkboxEl.checked;
            });
        });

export const addSpinner = (
    labelEl,
    latencyTimeout = 500
) =>
    fastdom
        .mutate(() => {
            labelEl.classList.add('is-updating');
            if (document.body) document.body.classList.add('is-updating-js');
        })
        .then(() => {
            labelEl.dataset.slowLoadTimeout = timeouts
                .push(
                    setTimeout(() => {
                        fastdom.mutate(() => {
                            if (document.body) {
                                document.body.classList.add(
                                    'is-updating-cursor'
                                );
                            }
                            labelEl.classList.add('is-taking-a-long-time');
                        });
                    }, latencyTimeout)
                )
                .toString();
        });

export const removeSpinner = (labelEl) =>
    fastdom.mutate(() => {
        if (document.body) document.body.classList.remove('is-updating-cursor');
        if (document.body) document.body.classList.remove('is-updating-js');
        labelEl.classList.remove('is-updating');
        labelEl.classList.remove('is-taking-a-long-time');
        clearTimeout(
            timeouts[parseInt(labelEl.dataset.slowLoadTimeout, 10) - 1]
        );
    });
