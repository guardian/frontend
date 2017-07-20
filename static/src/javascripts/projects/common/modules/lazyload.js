// @flow
import fetchJSON from 'lib/fetch-json';
import fastdom from 'lib/fastdom-promise';
import { identity } from 'lib/identity';

const lazyload = (
    url: string,
    container: Element,
    _options?: Object
): Promise<any> => {
    /*
        Accepts these options:

        url               - string
        container         - element object
        beforeInsert      - function applied to response html before inserting it into container, optional
        success           - callback function, optional
        error             - callback function, optional
        force             - boolean, default false. Reload an already-populated container
    */

    const options = Object.freeze(
        Object.assign(
            {
                beforeInsert: identity,
                finally: identity,
                catch: identity,
                force: false,
            },
            _options || {}
        )
    );

    if (!options.force && container.classList.contains('lazyloaded')) {
        return Promise.resolve();
    }

    return fetchJSON(url, {
        mode: 'cors',
    })
        .then((resp: { html: string }) =>
            fastdom.write(() => {
                container.innerHTML = options.beforeInsert(resp.html);
                container.classList.add('lazyloaded');
                return resp;
            })
        )
        .then(options.finally)
        .catch(options.catch);
};

export { lazyload };
