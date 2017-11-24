// @flow

import { _ as robust } from 'lib/robust';
import fastdom from 'lib/fastdom-promise';

const loadEnhancers = (loaders: Array<any>): void => {
    loaders.forEach(([classname: string, action: Function]) =>
        fastdom
            .read(() => [...document.querySelectorAll(classname)])
            .then(elements =>
                elements.forEach((element: any) => {
                    robust.catchAndLogError(classname, () => {
                        action(element);
                    });
                })
            )
    );
};

export default loadEnhancers;
