import Raven from 'raven-js';
import {model} from 'modules/vars';

export default function (ex) {
    if (model.state().defaults.dev) {
        throw ex;
    } else {
        Raven.captureException(ex);
    }
}
