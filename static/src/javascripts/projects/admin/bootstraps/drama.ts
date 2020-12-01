const typewrite = (message: string, $target: Element) =>
    new Promise((yay) => {
        let i = 0;
        const len = message.length;
        const itv = setInterval(() => {
            i += 1;
            $target.innerText = [...message.split('').splice(0, i), 'X'].join(
                ''
            );
            if (i >= len) {
                clearInterval(itv);
                $target.innerText = message;
                setTimeout(() => {
                    yay();
                }, 400);
            }
        }, 25);
    });

const timeout = (to: number, $target: Element) =>
    new Promise((yay) => {
        const target = Date.now() + to * 1000;
        const loop = () =>
            requestAnimationFrame(() => {
                const diff = target - Date.now();
                $target.innerText = `00:00:${Math.ceil(diff / 1000)
                    .toString()
                    .padStart(2, '0')}:${(diff % 1000)
                    .toString()
                    .padStart(3, '0')}`;
                if (diff > 0) {
                    loop();
                } else {
                    $target.innerText = `00:00:00:000`;
                    yay();
                }
            });
        loop();
    });

const RawMessage = (title: string) => {
    const $wrapper = document.createElement('div');
    $wrapper.classList.add('admin-drama__message');
    const $title = document.createElement('span');
    const $subtitle = document.createElement('strong');
    $title.innerText = title;
    [$title, $subtitle].forEach((_) => {
        $wrapper.append(_);
    });
    return {
        $wrapper,
        $subtitle,
        $title,
        destroy: () => {
            $wrapper.dataset.out = 'true';
            // setTimeout(()=>{$wrapper.remove()},200);
        },
    };
};

const Message = (title: string, subtitle: string) => {
    const { $wrapper, $title, $subtitle, destroy } = RawMessage(title);
    return {
        $wrapper,
        $title,
        $subtitle,
        destroy,
        type: () => typewrite(subtitle, $subtitle),
    };
};

const Timeout = (title: string, to: number) => {
    const { $wrapper, $title, $subtitle, destroy } = RawMessage(title);
    $wrapper.dataset.critical = 'true';
    return {
        $wrapper,
        $title,
        $subtitle,
        destroy,
        type: () => timeout(to, $subtitle),
    };
};

const Line = (line, isHead = false) => {
    const $wrapper = document.createElement('div');
    if (isHead) $wrapper.classList.add('admin-drama__head');
    return {
        $wrapper,
        type: () => typewrite(line, $wrapper),
    };
};

const LineHead = (line) => Line(line, true);

const writeTextLines = ($repl: Element): Promise<void> => {
    const text = [
        LineHead('System online'),
        Line('User authenticated'),
        Line('... Initiating launch routine'),
        Line('OK'),
        Line('Launch routine initiated'),
        LineHead('Action required'),
        Line('Confirm launch procedure'),
        Line('Input launch passphrase now'),
    ];
    return text.reduce(
        (promiseChain, currentTask) =>
            promiseChain.then(() => {
                const { $wrapper, type } = currentTask;
                $repl.appendChild($wrapper);
                return type();
            }),
        Promise.resolve()
    );
};

const awaitForFormInput = ({ $repl }): Promise<void> =>
    new Promise((yay) => {
        const $txt = document.createElement('input');
        const $form = document.createElement('form');
        $txt.type = 'password';
        $form.appendChild($txt);
        $repl.appendChild($form);
        $txt.focus();
        $form.addEventListener('submit', (ev) => {
            ev.preventDefault();
            $repl.dataset.disabled = 'true';
            yay();
        });
    });

const showSuccessMsg = ({ $bg, $drama }): Promise<void> =>
    new Promise((yay) => {
        const $status = Message('Status report', 'access granted');
        setTimeout(() => {
            $bg.dataset.white = 'true';
            $drama.appendChild($status.$wrapper);
            setTimeout(() => {
                $status.type().then(() => {
                    $status.destroy();
                    yay();
                });
            });
        }, 500);
    });

const showCountdownMsg = ({ $drama }): Promise<void> =>
    new Promise((yay) => {
        const $countdown = Timeout('Launch in', 5);
        setTimeout(() => {
            $drama.appendChild($countdown.$wrapper);
            setTimeout(() => {
                $countdown.type().then(() => {
                    $countdown.destroy();
                    yay();
                });
            });
        }, 500);
    });

const start = ($switchboard: HTMLFormElement, $holder: Element) => {
    window.scrollTo(0, 0);

    const $drama = $holder.querySelector('.admin-drama-innermost');
    const $bg = $holder.querySelector('.admin-drama');
    const $html = document.documentElement;

    if (!$drama || !$bg || !$html) {
        throw Error('missing elements');
    }

    const $repl = $drama.querySelector('.admin-drama__input');

    if (!$repl) {
        throw Error('missing elements');
    }

    $html.classList.add('drama-init');

    setTimeout(() => {
        $switchboard.append($holder);
    }, 500);

    setTimeout(() => {
        writeTextLines($repl)
            .then(() => awaitForFormInput({ $repl }))
            .then(() => showSuccessMsg({ $bg, $drama }))
            .then(() => showCountdownMsg({ $drama }))
            .then(() => {
                $holder.remove();
                $html.classList.remove('drama-init');
                $html.classList.add('drama-outro');
                setTimeout(() => {
                    $switchboard.submit();
                }, 1000);
            });
    }, 2000);
};

const init = () => {
    const $switchboard = document.querySelector(
        '#switchboard'
    ;
    if (!$switchboard || !$switchboard.submit) return;
    const $trigger = $switchboard.querySelector('.drama-trigger');
    if (!$trigger) return;

    const $holder = document.createElement('div');
    $holder.innerHTML = `
        <div class="admin-drama admin-drama"><div class="admin-drama__shaker admin-drama-innermost">
            <div class="admin-drama__input">
            </div>
        </div></div>
        `;
    $trigger.addEventListener('click', () => {
        start($switchboard, $holder);
    });
};

export { init };
