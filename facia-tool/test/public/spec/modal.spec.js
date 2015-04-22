import Promise from 'Promise';
import ko from 'knockout';
import modalDialog from 'modules/modal-dialog';
import alert from 'utils/alert';
import sinon from 'sinon';
import $ from 'jquery';
import {register} from 'models/widgets';
import 'widgets/modal_dialog.html!text';
import 'widgets/text_alert.html!text';

describe('Modal Dialog', function () {
    beforeAll(function () {
        prepareTest(modalDialog);
    });
    afterAll(function () {
        cleanTest();
    });

    it('calls the ok function', function (done) {
        var ok = sinon.spy(),
            cancel = sinon.spy();

        openDialog({
            fruit: 'apple'
        }, ok, cancel)
        .then(function () {
            expect($('.test-container .what-i-like').text()).toBe('apple');

            return click('ok');
        })
        .then(function () {
            expect(ok.called).toBe(true);
            expect(cancel.called).toBe(false);
            expect($('.test-container .what-i-like').length).toBe(0);

            return openDialog({
                fruit: 'banana'
            }, ok, cancel);
        })
        .then(function () {
            expect($('.test-container .what-i-like').text()).toBe('banana');

            return click('cancel');
        })
        .then(function () {
            expect(cancel.called).toBe(true);
            expect($('.test-container .what-i-like').length).toBe(0);

            done();
        });
    });
});

describe('Alert', function () {
    beforeAll(function () {
        prepareTest(modalDialog);
    });
    afterAll(function () {
        cleanTest();
    });

    it('shows an error', function (done) {
        alert('expected error');
        setTimeout(function () {
            expect($('.test-container .modalDialog-message').text()).toMatch(/expected error/);
            done();
        }, 40);
    });
});

register();
ko.components.register('modal_template', {
    viewModel: {
        createViewModel: function (params) {
            return params;
        }
    },
    template: [
        '<div class="what-i-like" data-bind="text: fruit"></div>',
        '<button class="ok" data-bind="click: ok">OK</button>',
        '<button class="cancel" data-bind="click: cancel">Cancel</button>',
    ].join('')
});

var container;
function prepareTest (modal) {
    container = $([
        '<div class="test-container">',
            '<modal-dialog params="modal: modal"></modal-dialog>',
        '</div>'
    ].join(''));
    container.appendTo('body');

    ko.applyBindings({
        modal: modal
    }, container[0]);
}

function cleanTest () {
    ko.cleanNode(container[0]);
    container.remove();
}

function openDialog (data, ok, cancel) {
    return new Promise(function (resolve) {
        modalDialog.confirm({
            name: 'modal_template',
            data: data
        }).then(ok, cancel);

        // Knockout has to refresh the view
        setTimeout(function () {
            resolve();
        }, 50);
    });
}

function click (where) {
    return new Promise(function (resolve) {
        $('.test-container .' + where).click();
        // The native browser Promise is asynchronous
        setTimeout(function () {
            resolve();
        }, 10);
    });
}
