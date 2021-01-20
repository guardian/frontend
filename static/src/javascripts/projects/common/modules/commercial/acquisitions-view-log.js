import { storage } from '@guardian/libs';

const viewKey = 'gu.contributions.views';
const viewLog = storage.local.get(viewKey) || [];

const maxLogEntries = 50;

/**
 * Log that the user has seen an Epic test so we can limit how many times they see it.
 * The number of entries is limited to the number in maxLogEntries.
 *
 * @param testId
 */
const logView = (testId) => {
    viewLog.push({
        date: new Date().getTime(),
        testId,
    });

    storage.local.set(viewKey, viewLog.slice(-maxLogEntries));
};

const viewsInPreviousDays = (days, testId) => {
    const ms = days * 1000 * 60 * 60 * 24;
    const now = new Date().getTime();

    return viewLog.filter(
        view => (testId ? view.testId === testId : true) && view.date > now - ms
    ).length;
};

const clearViewLog = () => {
    storage.local.remove(viewKey);
};

const overallNumberOfViews = () => viewLog.length;

export { logView, viewsInPreviousDays, overallNumberOfViews, clearViewLog };
