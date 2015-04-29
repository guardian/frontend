import modalDialog from 'modules/modal-dialog';

export default function (message) {
    modalDialog.confirm({
        name: 'text_alert',
        data: {
            message: message
        }
    });
}
