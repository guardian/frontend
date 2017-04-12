import Promise from 'Promise';
import assign from 'lodash/objects/assign';
export default loadScript;

function loadScript(src, props) {
    if (typeof src !== 'string') {
        return Promise.reject('no src supplied');
    }

    if (document.querySelector('script[src="' + src + '"]')) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const ref = document.scripts[0];
        const script = document.createElement('script');
        script.src = src;
        if (props) {
            assign(script, props);
        }
        script.onload = resolve;
        script.onerror = reject;
        ref.parentNode.insertBefore(script, ref);
    });
}
