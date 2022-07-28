// #? Clean up unused `data-` attributes
import bean from 'bean';
import { mediator } from 'lib/mediator';



let location;
let filters;

const filterSource = element => filters.filter(f => f === element);

const compareHosts = (url = '') => {
    if (url.startsWith('mailto:')) {
        return false;
    }

    const urlHost = url.match(/:\/\/(.[^/]+)/);

    // Lack of a urlHost implies a relative url.
    // For absolute urls we are protocol-agnostic,
    // e.g. we should treat https://www.theguardian.com/foo -> http://www.theguardian.com/bar as a same-host link.
    return !urlHost || urlHost[1] === location.hostname;
};

const getClickSpec = (spec, forceValid) => {
    if (!spec.el) {
        return false;
    }

    const el = spec.el;
    const elName = el.tagName.toLowerCase();
    const dataLinkName = el.getAttribute('data-link-name');

    if (dataLinkName) {
        spec.tags.unshift(dataLinkName);
    }

    if (elName === 'body') {
        spec.tag = spec.tags.join(' | ');
        delete spec.el;

        if (spec.validTarget && el.getAttribute('data-link-test')) {
            spec.tag = `${el.getAttribute('data-link-test') ||
                ''} | ${spec.tag || ''}`;
        }
        return spec;
    }

    const customEventProperties = JSON.parse(
        el.getAttribute('data-custom-event-properties') || '{}'
    );
    spec.customEventProperties = Object.assign(
        customEventProperties,
        spec.customEventProperties
    );

    if (!spec.validTarget) {
        spec.validTarget = filterSource(elName).length > 0 || !!forceValid;
        if (spec.validTarget) {
            const href = el.getAttribute('href');
            spec.target = el;
            spec.samePage =
                (href && href.startsWith('#')) ||
                elName === 'button' ||
                !!el.hasAttribute('data-is-ajax');

            spec.sameHost = spec.samePage || (!!href && compareHosts(href));
        }
    }

    // Pick up the nearest data-link-context
    if (!spec.linkContext && el.getAttribute('data-link-context-path')) {
        spec.linkContextPath = el.getAttribute('data-link-context-path') || '';
        spec.linkContextName = el.getAttribute('data-link-context-name') || '';
    }

    spec.el = (el.parentNode);

    return getClickSpec(spec);
};

const initClickstream = (opts = {}) => {
    // Allow a fake window.location to be passed in for testing
    location = opts.location || window.location;
    filters = opts.filter || [];

    // delegate, emit the derived tag
    bean.add(
        document.body,
        'click',
        (event) => {
            const clickSpec = getClickSpec({
                el: (event.target),
                tags: [],
                target: (event.target),
            });

            mediator.emit('module:clickstream:click', clickSpec);
        }
    );
};

export { initClickstream };
