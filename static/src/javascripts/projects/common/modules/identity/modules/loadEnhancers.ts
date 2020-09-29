

import { _ as robust } from "lib/robust";
import fastdom from "lib/fastdom-promise";

/* TODO:Improve type checking here */

const loadEnhancers = (loaders: Array<Array<any>>): void => {
  loaders.forEach(([classname, action]) => {
    if (typeof classname !== 'string') throw new Error('Invalid classname');
    if (typeof action !== 'function') throw new Error('Invalid action');
    return fastdom.read(() => Array.from(document.querySelectorAll(classname))).then(elements => elements.forEach((element: HTMLElement) => {
      robust.catchAndLogError(classname, () => {
        action(element);
      });
    }));
  });
};

export default loadEnhancers;