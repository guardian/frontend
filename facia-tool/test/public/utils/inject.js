import ko from 'knockout';
import Promise from 'Promise';
import {register} from 'models/widgets';
import * as wait from 'test/utils/wait';

export default function (html) {
    register();
    const DOM_ID = 'test_dom_' + Math.round(Math.random() * 10000);

    document.body.innerHTML += `
        <div id="${DOM_ID}">
            ${html}
        </div>
    `;

    let container = document.getElementById(DOM_ID);
    return {
        container,
        apply: (model, waitWidget) => {
            return new Promise(resolve => {
                if (waitWidget) {
                    wait.event('widget:load').then(resolve);
                } else {
                    setTimeout(resolve, 10);
                }
                ko.applyBindings(model, container);
            });
        },
        dispose: () => {
            ko.cleanNode(container);
            container.parentNode.removeChild(container);
        }
    };
}
