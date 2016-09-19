define([
    'common/utils/config',
    'common/utils/$',
    'common/utils/storage'
], function (
    config,
    $,
    storage
) {
    function init() {
        if( config.page.pageId === 'contributor-email-page-submitted' ) {
            storage.local.set('gu.contributor', true);
        }
    }

    return init;

});
