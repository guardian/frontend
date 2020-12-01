import fastdom from 'lib/fastdom-promise';
import { _ as robust } from 'lib/robust';

/* TODO:Improve type checking here */

const loadEnhancers = (loaders: any[][]): void => {
    loaders.forEach(([classname, action]) => {
        if (typeof classname !== 'string') throw new Error('Invalid classname');
        if (typeof action !== 'function') throw new Error('Invalid action');
        return fastdom
            .measure(() => Array.from(document.querySelectorAll(classname)))
            .then((elements) =>
                elements.forEach((element: HTMLElement) => {
                    robust.catchAndLogError(classname, () => {
                        action(element);
                    });
                })
            );
    });
};

export default loadEnhancers;
