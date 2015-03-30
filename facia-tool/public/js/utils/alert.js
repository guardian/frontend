define([
    'modules/modal-dialog'
], function (
    modalDialog
) {
    return function (message) {
        modalDialog.confirm({
            name: 'text_alert',
            data: {
                message: message
            }
        });
    };
});
