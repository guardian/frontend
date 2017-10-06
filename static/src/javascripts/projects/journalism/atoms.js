// @flow
// globals guardian

import { ophan, dom, viewport } from './services';

const bootAtomType = (atomType: string, atomFactory: Function): void => {
    const atomBuilder = atomFactory.default({ ophan, dom, viewport });
    const atoms = document.querySelectorAll(
        `.element-atom[data-atom-type="${atomType}"]`
    );
    for (let i = 0; i < atoms.length; i += 1) {
        const atom = atomBuilder(atoms[i]).runTry();
        atom.start();
    }
};

const init = (): void => {
    // const atomTypes: Object = guardian.atoms;
    const atomTypes: Object = {};
    Object.keys(atomTypes).forEach((t: string) => {
        const f = atomTypes[t];
        if (typeof f.default !== 'function' || f.default.length !== 1) return;
        bootAtomType(t, atomTypes[t]);
    });
};

export { init };
