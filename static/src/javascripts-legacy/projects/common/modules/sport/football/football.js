define(['common/modules/component'], function(Component) {
    /**
     * @param {string} endpoint
     * @return Component
     */
    function blankComponent(url) {
        var c = new Component();
        c.endpoint = url;
        return c;
    }

    /**
     * @param {string} competition
     * @param {string} date in format 02/oct/1869
     * @return Component
     */
    function matchDayFor(competition, date) {
        return blankComponent(
            '/football/match-day/' + competition + '/' + date + '.json'
        );
    }

    /**
     * @param {string} competition
     * @return Component
     */
    function tableFor(competition) {
        return blankComponent('/football/' + competition + '/table.json');
    }

    /**
     * @param {string} url
     * @return Component
     * TODO (jamesgorrie): unfortunately we have no easy way of getting the stats
     * So therefor take the whole URL
     */
    function statsFor(url) {
        return blankComponent(url + '.json');
    }

    return {
        matchDayFor: matchDayFor,
        tableFor: tableFor,
        statsFor: statsFor,
    };
}); //define
