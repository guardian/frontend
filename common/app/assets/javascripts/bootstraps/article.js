define(['modules/related', 'modules/upgradeImages'], function(related, images){

    return {
        init: function(config) {
            url = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
            return (new related(document.getElementById('related')).load(url));
        }
    }

});
