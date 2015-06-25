import Raven from 'raven-js';
import {pageConfig} from 'modules/vars';

export default function (ex) {
    if (pageConfig.dev) {
        throw ex;
    } else {
        Raven.captureException(ex);
    }
}
