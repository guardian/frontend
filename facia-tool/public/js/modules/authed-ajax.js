import _ from 'underscore';
import $ from 'jquery';
import Promise from 'Promise';
import {CONST} from 'modules/vars';
import {reauth} from 'utils/oauth-session';

function collectionEndPoint (isTreats, edits) {
    if (isTreats) {
        return CONST.apiBase + '/treats/' + (edits.update || edits.remove).id;
    } else {
        return CONST.apiBase + '/edits';
    }
}

function generateErrorCallback (win, reject, retry) {
    win = win || window;
    function redirect (xhr) {
        win.location.reload(true);
        reject(xhr);
    }
    return function (xhr) {
        if (xhr.status === 403) {
            redirect(xhr);
        } else if (xhr.status === 419) {
            if (retry) {
                // Try once more after re-auth
                reauth().then(retry).catch(redirect);
            } else {
                redirect(xhr);
            }
        } else {
            reject(xhr);
        }
    };
}

function request(opts, win) {
    var message = _.extend({}, {
        dataType: !opts.type ? 'json' : undefined,
        contentType: opts.data ? 'application/json' : undefined
    }, opts);

    return new Promise(function (resolve, reject) {
        $.ajax(message)
            .done(resolve)
            .fail(generateErrorCallback(win, reject, function () {
                $.ajax(message)
                    .done(resolve)
                    .fail(generateErrorCallback(win, reject));
            }));
    });
}

function updateCollections(edits, win) {
    var collections = [];

    var isTreats = false;
    _.each(edits, function(edit) {
        if(_.isObject(edit)) {
            edit.collection.setPending(true);
            edit.id = edit.collection.id;
            collections.push(edit.collection);
            delete edit.collection;
            edit.live = edit.mode === 'live';
            edit.draft = edit.mode === 'draft';
            isTreats = edit.mode === 'treats';
            delete edit.mode;
        }
    });

    edits.type = [
        edits.update ? 'Update' : null,
        edits.remove ? 'Remove' : null
    ].filter(function(s) { return s; }).join('And');

    return request({
        url: collectionEndPoint(isTreats, edits),
        type: 'POST',
        data: JSON.stringify(edits)
    }, win)
    .then(function (resp) {
        return Promise.all(_.map(collections, collection => new Promise(resolve => {
            collection.populate(resp[collection.id], resolve);
        })));
    })
    .catch(function (ex) {
        _.each(collections, collection => collection.load());
        throw ex;
    });
}

export {
    request,
    updateCollections
};
