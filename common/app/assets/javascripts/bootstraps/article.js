define(['modules/related', 'modules/upgradeImages'], function(related, images){

    return {
        init: function(config) {
            
            var url = config.page.coreNavigationUrl + '/related/UK/' + config.page.pageId;
            
            // upgrade images
            new images().upgrade();

            // load related
            new related(document.getElementById('related')).load(url);

            return true;
        }
    }

});
