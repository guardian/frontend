define(['modules/football/leagueTable', 'modules/football/matchStats'], function(LeagueTable, MatchStats){

    function Football(config){

        var footballServer = config.page.footballUrl;

        if(config.page.contentType === 'Article' /*&& config.references.footballMatches*/) {
            new MatchStats('3517708', footballServer, config.page.live).load();
        }

        if(config.page.contentType === 'Tag' /*&& config.references.footballTournaments*/) {
            new LeagueTable('100', footballServer).load();
        }

//        if(config.page.contentType === 'Tag' /*&& config.references.footballTeams*/) {
//            //....  pimp club page
//        }
//
//        if(config.page.pageId === 'football') {
//            //....  pimp football front
//        }
//
//        if(config.page.contentType === 'Network Front' && config.page.pageId === '') {
//            //....  pimp network front
//        }
    }

    return Football;

});
