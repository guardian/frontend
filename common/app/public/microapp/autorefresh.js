jQ(function() {

    var refreshInterval = 60,
        node = jQ('#match-stats-summary'),
        contentUrl = node.attr('data-ajax-url');

    function reloadScores() {
        jQ.ajax({
            url: contentUrl,
            cache: true,
            jsonpCallback: 'scorescb',
            success: function(response) {
                node.html(response.scores);
                setTimeout(reloadScores, refreshInterval * 1000);
            }
        })
    }

    // First load
    reloadScores();
});