import _ from 'underscore';
import BaseClass from 'models/base-class';
import {request} from 'modules/authed-ajax';
import {CONST} from 'modules/vars';
import mediator from 'utils/mediator';
import debounce from 'utils/debounce';

var detectFailuresSym = Symbol();

export default class Presser extends BaseClass {
    constructor() {
        super();

        this[detectFailuresSym] = debounce(front => {
            return request({
                url: '/front/lastmodified/' + front
            })
            .catch(res => {
                // TODO Phantom Babel bug
                if (!res) { res = {}; }
                return {
                    responseText: res.responseText
                };
            });
        }, CONST.detectPressFailureMs || 10000);

        this.listenOn(mediator, 'presser:detectfailures', this.detectFailures);
    }

    detectFailures(front) {
        return this[detectFailuresSym](front)
        .then(resp => {
            // TODO Phantom Babel bug
            if (!resp) { resp = {}; }
            var lastPressed = new Date(resp.responseText);

            if (_.isDate(lastPressed)) {
                mediator.emit('presser:lastupdate', front, lastPressed);
            }
        });
    }

    press(env, front) {
        return request({
            url: '/press/' + env + '/' + front,
            method: 'post'
        })
        .then(() => {
            if (env === 'live') {
                return this.detectFailures(front);
            }
        })
        .catch(() => {});
    }

    dispose() {
        super.dispose();
        this[detectFailuresSym].dispose();
    }
}
