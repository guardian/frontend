import {CONST} from 'modules/vars';

export default function (pathname) {
    // TODO Phantom Babel bug
    pathname = pathname || window.location.pathname;
    var priority = pathname.match(/^\/?([^\/]+)/);
    if (priority && priority[1] !== CONST.defaultPriority) {
        return priority[1];
    }
}
