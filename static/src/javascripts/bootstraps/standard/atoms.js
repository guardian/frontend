import config from 'lib/config';
import { services } from 'projects/atoms/services';

const bootstrapAtom =(atomMaker, atomType) => {
    const atomBuilder = atomMaker[atomType].default(services);
    Array.from(
        document.querySelectorAll(`[data-atom-type='${atomType}']`)
    ).forEach(atomDom => {
        const atom = atomBuilder(atomDom).runTry();
        if (typeof atom === 'string') {
            // eslint-disable-next-line no-console
            console.log(
                `Failed to initialise atom [${atomType}/${atomDom.getAttribute(
                    'data-atom-id'
                ) || ''}]: ${atom}`
            );
        } else if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                atom.start();
            });
        } else {
            atom.start();
        }
    });
};

const initCharts = () => {
    const iframes = ([
        ...document.querySelectorAll('.atom--chart > .atom__iframe'),
    ]);

    window.addEventListener('message', event => {
        const iframe = iframes.find(i => {
            try {
                return i.name === event.source.name;
            } catch (e) {
                return false;
            }
        });
        if (iframe) {
            try {
                const message = JSON.parse(event.data);
                switch (message.type) {
                    case 'set-height':
                        iframe.height = message.value;
                        break;
                    default:
                }
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    });

    iframes.forEach(iframe => {
        const src = (iframe.getAttribute('srcdoc') || '')
            .replace(/<gu-script>/g, '<script>')
            // eslint-disable-next-line no-useless-concat
            .replace(/<\/gu-script>/g, '<' + '/script>');
        iframe.setAttribute('srcdoc', src);
    });
};
