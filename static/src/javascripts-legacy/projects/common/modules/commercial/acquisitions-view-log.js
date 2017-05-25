define([
    'lib/storage'
], function (storage) {

    var viewKey = 'gu.contributions.views';
    var viewLog = storage.local.get(viewKey) || [];


    var maxLogEntries = 50;

    /**
     * Log that the user has seen an Epic test so we can limit how many times they see it.
     * The number of entries is limited to the number in maxLogEntries.
     *
     * @param testId
     */
    function logView(testId) {
        viewLog.push({
            date: new Date().getTime(),
            testId: testId
        });
        storage.local.set(viewKey, viewLog.slice(-maxLogEntries));
    }

    function viewsInPreviousDays(days, test) {
        var ms = days * 1000 * 60 * 60 * 24;
        var now = new Date().getTime();

        return viewLog.filter(function (view) {
            return (test ? view.testId === test.id : true) && view.date > (now - ms);
        }).length;
    }

    return {
        logView: logView,
        viewsInPreviousDays: viewsInPreviousDays
    }
});
